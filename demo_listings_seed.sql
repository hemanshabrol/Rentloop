-- ============================================================================
-- FILE: demo_listings_seed.sql
-- PURPOSE:
--   Seeds realistic DEMO rental products and gallery images into public.listings
--   and public.listing_images for initial Marketplace development.
--
-- IMPORTANT NOTES:
--   1. Does NOT modify schema.sql, constraints, or RLS policies.
--   2. Uses your first real registered profile in public.profiles as owner_id
--      (never invents fake UUIDs).
--   3. Safe to run multiple times (skips any demo item that already exists).
--   4. Clearly treated as initial development demo data; real student-created
--      listings will use the exact same tables and relationships.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_owner_id UUID;
  v_listing_id BIGINT;
BEGIN
  -- Use the first existing student account in public.profiles
  SELECT id INTO Strict v_owner_id
  FROM public.profiles
  ORDER BY created_at ASC
  LIMIT 1;

  -- 1. Demo Listing: Canon EOS R5 Mirrorless Camera
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Canon EOS R5 Mirrorless Camera') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Canon EOS R5 Mirrorless Camera',
      'Photography & Video',
      'Canon EOS R5 + RF 50mm f/1.8 STM',
      '[Demo Listing] High-end 45MP full-frame mirrorless camera capable of 8K RAW video and 20fps burst shooting for student film and photography projects.',
      'Excellent',
      800,
      'North Quad Dorms',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnj2Y5vDKxGo_I0ZzjtGS4ITW4IZNzf3DOjYmJThYoIACoMUmos-zkJMuyRRhrZR55z2ucJ_U1f-zECTDq556xkAlMBzieCc26kiJevwY9XhbAI6aM5O_ld5owoDPU3JXEu4tFV9O7Ns3lezJNIzBGXQYwHMJC4Pg_LR3o7Ciw4LjFjf9LFeHKBKcirp-HTfJGTN6DKsqBY6JyM_1JBolSgdOw-9Q8u85MiaNGyrs', 0),
      (v_listing_id, 'https://lh3.googleusercontent.com/aida/ALJJyrBTmXkgC-fO_5X9zHQAbixQi-PyDL2CuC3JxHu0l031rAFiT1MDpD5A0QgrJ8PuHQVIR4f694S9n1vcOX7eVC2ZNyxlPIQ8gbNYMl6ZXQAPqLuk8IYnVFfzGJzYeZOd5QZY-R3dSwcQZGpiEG7itVqm3rjmi70-xUGkpeBPXyDZCvMQ5tZHtG3v-Z7pAAY0Fj_a8ZwI924mCT09rBPrGRg0jEsFHTn64GitS2A1b0-r', 1),
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPHX6Zduacm2lyvOz1Mhp6BIWSLaftlxNGDKuSnLMsFy5V-NBp7TGElJEpTnDVka9H74LapvX67PHOdHWpH4pxgy9lADFl9mHiefx14QX415t55axbUlkleSpAhdVTSxdF2-baJeneCQhEXmGj5Dt9sliHY7MvRgKDUKKfVNFGk1LFtDb1RBRpwhqQ8Xw1AEuRruaKN6KQlmUUeZaR3ZJtNV6wTrdZn3SlanMS3gA', 2);
  END IF;

  -- 2. Demo Listing: Trek Dual Sport Bicycle
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Trek Dual Sport Bicycle') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Trek Dual Sport Bicycle',
      'Sports & Mobility',
      'Trek Dual Sport Hybrid + U-Lock',
      '[Demo Listing] Versatile commuter and trail hybrid bicycle ideal for getting across campus quickly. Includes a heavy-duty U-lock, LED lights, and helmet.',
      'Excellent',
      300,
      'West Dorms',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy5VXS5uDqAUqIISJ9xR1B4Zv8aoJBayuAJQ4_QnTEeZkVUC27bH506R5L09r8ylT8ybrrZ1v7gn_OjOhQGYona-62aw_O3NHUOrJEgx0p01_4r7qmhcR0lINvbL_fsEXg9eQ7pILroKp32BzmI-Fu8krlmrBEOgyvPYlDeAcS9LIgvm30g8aDF3cQdLaKY0XXU4PtWBer-YK-gcUlQidPxGsBrzJec9z3wgmhOqA', 0);
  END IF;

  -- 3. Demo Listing: Epson Cinema Projector
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Epson Cinema Projector') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Epson Cinema Projector',
      'Event Equipment',
      'Epson 1080p Full HD + HDMI',
      '[Demo Listing] Bright 1080p home cinema and presentation projector suitable for dorm movie nights, club presentations, and design critiques.',
      'Like New',
      600,
      'East Commons',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcQ9m8qcoWE1GnJTb4x5wdplVAmpMVsm0FlxDYl4LQjG8DPHvHQ0EGwNCNrilRqGP7yj3_HVGimH91THw7cBj_K1ftkTcPzLYXfRJrIoDlW0YdjdEQfTvwg4PLak61Suh52WHAPtJZYbFm-SnLNF3bJoYtJEd2AoFMZQnYDvRcA687CNaHSpymFep1yGSO4K1_d0MlzZRdqqvv9JUVXNiJuAfLgFgkkaObRYTRR08', 0);
  END IF;

  -- 4. Demo Listing: TI-84 Plus CE Calculator
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'TI-84 Plus CE Calculator') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'TI-84 Plus CE Calculator',
      'Academic & STEM Tools',
      'Texas Instruments TI-84 Plus CE',
      '[Demo Listing] Approved color graphing calculator for engineering, calculus, and statistics exams with rechargeable battery and USB cable.',
      'Excellent',
      100,
      'Engineering Hall',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFrQkq2EkNiDdx3wknRRl6LvNiioY5BFvZcsUPtUXsKFRw8rnTvB3rNIGC3b2LWXMcHt6M8RCGWT4Hy5K01ZC1xGAQRAiLBWHQp0ejslOUEvidP0KiRpVlDnbRKS2khFqPv40Uhxxk52PYb5egsOiFh0LbMJoeok6ojhx_Ay37D4OkUwHaACxmcjJemF9DxXbiwf3pkMswW7rbSz0qs26HbZaarHm9tKGiuj7EGLU', 0);
  END IF;

  -- 5. Demo Listing: Sony Bluetooth Speaker
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Sony Bluetooth Speaker') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Sony Bluetooth Speaker',
      'Electronics & Audio',
      'Sony SRS-XB43 Extra Bass',
      '[Demo Listing] Portable wireless Bluetooth speaker with deep bass, IP67 waterproof protection, and 24-hour battery life for quad events.',
      'Good',
      200,
      'South Quad',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9IPaJZSaQwdLrCFxfNYWQEx8TI7jnZK3nNfNEdjfAfb8nZMrBGxtx32C5ekG38Pf6djl2v0QtauepJgTRPUfq-a_p7TZWD_zCc3f1MynjXd9xK_uu7KsNFt99MtyknWausepfDaJcPqRfEltnlh1g3P5Yq3_9uG9fPCyaI192_jhrZxnglukzNNMZ4470X81aPhILCi3TwneCo6rdd4sXWpfcc1Wq-gI_OGAb38w', 0);
  END IF;

  -- 6. Demo Listing: Heavy-Duty Tripod Stand
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Heavy-Duty Tripod Stand') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Heavy-Duty Tripod Stand',
      'Photography & Video',
      'Carbon Fiber Fluid-Head Tripod',
      '[Demo Listing] Sturdy carbon-fiber tripod with fluid pan/tilt head and Arca-Swiss quick-release plate supporting DSLR and mirrorless setups.',
      'Excellent',
      150,
      'Arts & Media Center',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdqlWV6qfmihfAindHgCoaStyiTPTHdtl-V7pXv_tB-IktWTIRZxCpwfJvxlAAXX5B02oWKjsp9WM_8I9iL0qC0A4_nFmvTiHww_s0mu_0v2dPx0QbngSkUEpf7paCngMyKJeiDnP7M8RhHsFt-SB3vEnloMdAzcm6aOXeOU2VkptWUKwJ8383XMf_OdgJOms4G5djUoh-m7SgkQWriw3nUWr31D6PUUvoFEYjbqo', 0);
  END IF;

  -- 7. Demo Listing: Scientific Lab Kit & Sensors
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Scientific Lab Kit & Sensors') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Scientific Lab Kit & Sensors',
      'Academic & STEM Tools',
      'True-RMS Multimeter + Sensor Pack',
      '[Demo Listing] Complete electronics and physics lab kit including an auto-ranging digital multimeter, breadboard jumper set, and sensor modules.',
      'Excellent',
      250,
      'Science & Bio-X Center',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL-cSfl71FYJJZMm4qU1O7hiLzUODEaRdecQjggAINivYgcwuWgfCFdFY1WR-E2rJu4Vb9mh-xRDI4FbLyn97qxWwhSw_CkhisMMf0cO_7Q3VHwFMWuxnS7ikCPwSi25tCz8PkHY2TXz34WaaQ7ts1gFD6ENBxDe9sH84UgVuua63Agc9dkfVErM4Wt8sz-27TbFfnjYS0qi_iVLlPDYgw-bVG_OhkgCe7zG3W-Yk', 0);
  END IF;

  -- 8. Demo Listing: Wireless Lapel Mic Kit
  IF NOT EXISTS (SELECT 1 FROM public.listings WHERE item_name = 'Wireless Lapel Mic Kit') THEN
    INSERT INTO public.listings (
      owner_id, item_name, category, brand_model, description, condition, daily_price, pickup_location, availability_status
    )
    VALUES (
      v_owner_id,
      'Wireless Lapel Mic Kit',
      'Electronics & Audio',
      'Dual-Channel Wireless Lavalier System',
      '[Demo Listing] Compact dual-channel wireless lapel microphone system for student interviews, documentaries, and lecture recordings.',
      'Like New',
      350,
      'Arts & Media Lab',
      'available'
    )
    RETURNING id INTO Strict v_listing_id;

    INSERT INTO public.listing_images (listing_id, image_url, display_order) VALUES
      (v_listing_id, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxWC7xXhvMXk2ioOCByBaws7aH5Vc9qDKjVdGasvbq5F5VnQIqhwPafXyjrpRRK3Hu447-3R4jDU2gRBsFbySAQrD7F1FnlTRSN97BuE3_NolsIkyHSOEDWvs9jnG4l5bjGxD6dnx1VPCzyD-1BSIJZa4uQxSdDRmUFhmFUJXxMd40r3u6j3HvkQ5fKJQUQ2eDu95Yo1yCDze-3sx5KsVkNoWXt2QCcHQrgs50jao', 0);
  END IF;
END $$;

COMMIT;

