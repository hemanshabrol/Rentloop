-- ============================================================================
-- MIGRATION: 202611190001_rental_availability_rules.sql
-- PROJECT:   RentLoop (Supabase PostgreSQL)
-- PURPOSE:
--   Completes the database-level rental availability lifecycle and RLS visibility
--   without altering existing tables, columns, or user data:
--     1. Adds indexes on foreign keys and status columns.
--     2. Upgrades check_booking_rules() to lock the listing row (FOR UPDATE),
--        block new requests while a listing has an active approved rental,
--        and enforce valid booking_status transitions
--        (pending -> approved/declined, approved -> returned).
--     3. Adds an AFTER UPDATE trigger on public.bookings that automatically
--        sets listings.availability_status = 'paused' when a booking is approved
--        and restores listings.availability_status = 'available' when marked returned.
--     4. Prevents manually setting a listing back to 'available' while an
--        approved rental is still active (unreturned).
--     5. Updates listings & listing_images SELECT RLS policies using a
--        non-recursive SECURITY DEFINER helper so renters can still view the
--        listing details of their own bookings in "My Rentals" while the
--        listing is rented ('paused').
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. INDEXES FOR FOREIGN KEYS & STATUS QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_listings_owner_id
  ON public.listings(owner_id);

CREATE INDEX IF NOT EXISTS idx_listings_availability_category
  ON public.listings(availability_status, category);

CREATE INDEX IF NOT EXISTS idx_bookings_listing_status
  ON public.bookings(listing_id, booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_renter_id
  ON public.bookings(renter_id);


-- ============================================================================
-- 2. UPGRADED BOOKING VALIDATION & STATE-TRANSITION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_booking_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_owner_id UUID;
  v_daily_price INTEGER;
  v_status TEXT;
  v_has_active_rental BOOLEAN;
BEGIN
  -- Lock the parent listing row to serialize concurrent booking requests/approvals
  SELECT owner_id, daily_price, availability_status
  INTO v_owner_id, v_daily_price, v_status
  FROM public.listings
  WHERE id = NEW.listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The selected listing does not exist.';
  END IF;

  -- Rule 9: Prevent self-rental
  IF v_owner_id = NEW.renter_id THEN
    RAISE EXCEPTION 'Students cannot rent their own listing.';
  END IF;

  -- Check if this listing already has an active (unreturned) approved booking
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.listing_id = NEW.listing_id
      AND b.booking_status = 'approved'
      AND b.id IS DISTINCT FROM NEW.id
  )
  INTO v_has_active_rental;

  IF TG_OP = 'INSERT' THEN
    -- Rule 3: New booking requests must start as 'pending'
    IF NEW.booking_status <> 'pending' THEN
      RAISE EXCEPTION 'New booking requests must start with pending status.';
    END IF;

    -- Rule 6: Rented or paused listings cannot accept new booking requests
    IF v_status <> 'available' OR v_has_active_rental THEN
      RAISE EXCEPTION 'This listing is currently rented or paused and cannot accept new requests.';
    END IF;

    -- Rule 10: Prevent past start dates and price tampering
    IF NEW.start_date < CURRENT_DATE THEN
      RAISE EXCEPTION 'Start date cannot be in the past.';
    END IF;

    IF NEW.daily_price <> v_daily_price THEN
      RAISE EXCEPTION 'Booking daily price must match the listing daily price.';
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Core booking attributes are immutable after creation
    IF NEW.listing_id <> OLD.listing_id
       OR NEW.renter_id <> OLD.renter_id
       OR NEW.start_date <> OLD.start_date
       OR NEW.end_date <> OLD.end_date
       OR NEW.daily_price <> OLD.daily_price
       OR NEW.total_price <> OLD.total_price THEN
      RAISE EXCEPTION 'Booking dates, price, and participants cannot be changed.';
    END IF;

    -- Enforce valid booking status lifecycle transitions:
    --   pending  -> approved | declined
    --   approved -> returned
    IF OLD.booking_status = 'pending' THEN
      IF NEW.booking_status NOT IN ('pending', 'approved', 'declined') THEN
        RAISE EXCEPTION 'A pending booking can only be approved or declined.';
      END IF;
    ELSIF OLD.booking_status = 'approved' THEN
      IF NEW.booking_status NOT IN ('approved', 'returned') THEN
        RAISE EXCEPTION 'An approved booking can only be marked as returned.';
      END IF;
    ELSE
      -- 'declined' and 'returned' are final states
      IF NEW.booking_status <> OLD.booking_status THEN
        RAISE EXCEPTION 'Declined or returned bookings cannot be reopened.';
      END IF;
    END IF;

    -- Rule 5 & 6: Approving a request requires the listing to be available and unrented
    IF NEW.booking_status = 'approved' AND OLD.booking_status <> 'approved' THEN
      IF v_status <> 'available' OR v_has_active_rental THEN
        RAISE EXCEPTION 'Cannot approve booking: this listing is currently rented or paused.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_booking_rules ON public.bookings;
CREATE TRIGGER trg_check_booking_rules
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_booking_rules();


-- ============================================================================
-- 3. AUTOMATIC LISTING AVAILABILITY SYNC ON APPROVAL & RETURN
--    - Rule 6: Approving a booking marks the listing 'paused' (rented/unavailable
--              in the public Marketplace).
--    - Rule 8: Marking an approved booking 'returned' restores the listing to
--              'available' in the Marketplace.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_listing_availability_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When a booking is approved, pause the listing so it is removed from public Marketplace
  IF NEW.booking_status = 'approved' AND OLD.booking_status <> 'approved' THEN
    UPDATE public.listings
    SET availability_status = 'paused'
    WHERE id = NEW.listing_id;

  -- When an approved booking is marked returned, make the listing available again
  ELSIF NEW.booking_status = 'returned' AND OLD.booking_status = 'approved' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.listing_id = NEW.listing_id
        AND b.booking_status = 'approved'
        AND b.id <> NEW.id
    ) THEN
      UPDATE public.listings
      SET availability_status = 'available'
      WHERE id = NEW.listing_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_listing_availability ON public.bookings;
CREATE TRIGGER trg_sync_listing_availability
  AFTER UPDATE OF booking_status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_listing_availability_on_booking();


-- ============================================================================
-- 4. PREVENT MANUALLY REACTIVATING A LISTING DURING AN ACTIVE APPROVED RENTAL
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_listing_availability_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.availability_status = 'available' AND OLD.availability_status = 'paused' THEN
    IF EXISTS (
      SELECT 1
      FROM public.bookings b
      WHERE b.listing_id = NEW.id
        AND b.booking_status = 'approved'
    ) THEN
      RAISE EXCEPTION 'Cannot mark listing as available while an approved rental is still active. Mark the rental as returned first.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_listing_availability_update ON public.listings;
CREATE TRIGGER trg_check_listing_availability_update
  BEFORE UPDATE OF availability_status ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_listing_availability_update();


-- ============================================================================
-- 5. RLS VISIBILITY FOR RENTERS ON RENTED ('paused') LISTINGS
--    Allows a renter who has a booking on a listing to continue reading that
--    listing's details and images in "My Rentals" while the listing is 'paused'
--    (rented), using a SECURITY DEFINER function to avoid RLS policy recursion.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_renter_for_listing(p_listing_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.listing_id = p_listing_id
      AND b.renter_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_renter_for_listing(BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_renter_for_listing(BIGINT) TO anon, authenticated;

DROP POLICY IF EXISTS "listings_select_visible" ON public.listings;
CREATE POLICY "listings_select_visible" ON public.listings
  FOR SELECT USING (
    availability_status = 'available'
    OR auth.uid() = owner_id
    OR public.is_renter_for_listing(id)
  );

DROP POLICY IF EXISTS "listing_images_select_visible" ON public.listing_images;
CREATE POLICY "listing_images_select_visible" ON public.listing_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.listings l
      WHERE l.id = listing_images.listing_id
        AND (
          l.availability_status = 'available'
          OR l.owner_id = auth.uid()
          OR public.is_renter_for_listing(l.id)
        )
    )
  );

-- Synchronize any pre-existing approved rentals with listings.availability_status
UPDATE public.listings l
SET availability_status = 'paused'
WHERE l.availability_status = 'available'
  AND EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.listing_id = l.id
      AND b.booking_status = 'approved'
  );

COMMIT;

