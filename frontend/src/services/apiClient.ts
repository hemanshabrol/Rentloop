// ============================================================================
// FILE: apiClient.ts
// Purpose: Reusable frontend API utility for communicating with the C++17
//          backend. Attaches the current Supabase session access token as
//          Authorization: Bearer <token> and maps database rows to UI types.
// ============================================================================

import { calculateInclusiveDays } from '../BookingSidebar';
import { ActivePeerRental, OwnerListing, OwnerRentalRequest, RentalItem } from '../data';
import { supabase } from '../supabaseClient';
import {
  CreateBookingPayload,
  CreateListingPayload,
  DatabaseBooking,
  DatabaseListing,
  HealthResponse,
  PublicProfile,
} from '../types/api';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const FALLBACK_COVER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnj2Y5vDKxGo_I0ZzjtGS4ITW4IZNzf3DOjYmJThYoIACoMUmos-zkJMuyRRhrZR55z2ucJ_U1f-zECTDq556xkAlMBzieCc26kiJevwY9XhbAI6aM5O_ld5owoDPU3JXEu4tFV9O7Ns3lezJNIzBGXQYwHMJC4Pg_LR3o7Ciw4LjFjf9LFeHKBKcirp-HTfJGTN6DKsqBY6JyM_1JBolSgdOw-9Q8u85MiaNGyrs';

// Retrieves the logged-in student's JWT access token from Supabase Auth
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// Sends an HTTP request to the C++17 backend with Authorization: Bearer <token>
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || errorData?.error || errorMessage;
    } catch {
      // Keep default HTTP status message if response is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

const PROFILE_CACHE_TTL_MS = 60_000;
let cachedProfileMap: Record<string, PublicProfile> | null = null;
let profileCacheExpiresAt = 0;
let inFlightProfilePromise: Promise<Record<string, PublicProfile>> | null = null;

// Fetches public profiles map (id -> { full_name, institution }) with a 60s cache and request deduplication
async function fetchPublicProfileMap(): Promise<Record<string, PublicProfile>> {
  const token = await getAccessToken();
  if (!token) return {};

  if (cachedProfileMap && Date.now() < profileCacheExpiresAt) {
    return cachedProfileMap;
  }
  if (inFlightProfilePromise) {
    return inFlightProfilePromise;
  }

  inFlightProfilePromise = apiRequest<PublicProfile[]>('/api/v1/public-profiles')
    .then((profiles) => {
      const map: Record<string, PublicProfile> = {};
      for (const p of profiles) {
        map[p.id] = p;
      }
      cachedProfileMap = map;
      profileCacheExpiresAt = Date.now() + PROFILE_CACHE_TTL_MS;
      inFlightProfilePromise = null;
      return map;
    })
    .catch(() => {
      inFlightProfilePromise = null;
      return {};
    });

  return inFlightProfilePromise;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (!parts[0]) return 'CP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function mapCategoryToFilterKey(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('photography')) return 'photography';
  if (lower.includes('electronics') || lower.includes('audio')) return 'audio';
  if (lower.includes('sports') || lower.includes('mobility')) return 'mobility';
  if (lower.includes('academic') || lower.includes('stem')) return 'academic';
  if (lower.includes('event')) return 'event';
  return 'other';
}

function mapPickupLocationToKey(pickupLocation: string): string {
  const lower = pickupLocation.toLowerCase();
  if (lower.includes('west')) return 'west';
  if (lower.includes('east') || lower.includes('south')) return 'east';
  if (lower.includes('science') || lower.includes('eng') || lower.includes('bio')) return 'science';
  if (lower.includes('art') || lower.includes('media')) return 'media';
  return 'north';
}

// Converts a DatabaseListing row into a UI RentalItem
export function mapDatabaseListingToRentalItem(
  row: DatabaseListing,
  profileMap: Record<string, PublicProfile> = {}
): RentalItem {
  const galleryUrls = [...(row.listing_images || [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.image_url);
  const coverUrl = galleryUrls[0] || FALLBACK_COVER_IMAGE;

  const ownerProfile = profileMap[row.owner_id];
  const ownerName = ownerProfile?.full_name || 'Verified Student';
  const ownerInstitution = ownerProfile?.institution || 'Campus Verified';

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.item_name,
    subtitle: row.brand_model || row.category,
    categoryKey: mapCategoryToFilterKey(row.category),
    categoryLabel: row.category,
    locationKey: mapPickupLocationToKey(row.pickup_location),
    ownerName,
    ownerInitials: getInitials(ownerName),
    ownerBio: `${ownerInstitution} · Verified Campus Peer`,
    ownerAndLocation: `${ownerName} · ${row.pickup_location}`,
    pricePerDay: row.daily_price,
    badgeNote: `${row.condition} Condition`,
    conditionNote: `${row.condition} — Verified campus listing`,
    condition: row.condition,
    pickupLocation: row.pickup_location,
    availabilityStatus: row.availability_status,
    description: row.description,
    imageUrl: coverUrl,
    imageAlt: row.item_name,
    galleryImages: galleryUrls.length > 0 ? galleryUrls : [coverUrl],
    inclusions: [
      row.item_name,
      row.brand_model ? `Model: ${row.brand_model}` : 'Standard accessories included',
      `Pickup at ${row.pickup_location}`,
    ],
    specs: [
      { label: 'Category', value: row.category.split('&')[0].trim(), sublabel: row.category },
      { label: 'Condition', value: row.condition, sublabel: 'Peer Inspected' },
      { label: 'Brand / Model', value: row.brand_model || 'Standard', sublabel: 'Verified Gear' },
      { label: 'Pickup Spot', value: row.pickup_location, sublabel: 'On-Campus Exchange' },
    ],
  };
}

// 1. Health check API call
export async function fetchHealthStatus(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/api/v1/health');
}

// 2. Listing API calls
export async function fetchMarketplaceListings(): Promise<RentalItem[]> {
  const [rows, profileMap] = await Promise.all([
    apiRequest<DatabaseListing[]>('/api/v1/listings'),
    fetchPublicProfileMap(),
  ]);
  return rows.map((row) => mapDatabaseListingToRentalItem(row, profileMap));
}

export async function fetchListingById(listingId: number): Promise<RentalItem> {
  const [row, profileMap] = await Promise.all([
    apiRequest<DatabaseListing>(`/api/v1/listings/${listingId}`),
    fetchPublicProfileMap(),
  ]);
  return mapDatabaseListingToRentalItem(row, profileMap);
}

export async function fetchMyOwnerListings(): Promise<OwnerListing[]> {
  const [rows, profileMap] = await Promise.all([
    apiRequest<DatabaseListing[]>('/api/v1/listings/my'),
    fetchPublicProfileMap(),
  ]);
  return rows.map((row) => ({
    item: mapDatabaseListingToRentalItem(row, profileMap),
    status: row.availability_status === 'available' ? 'active' : 'paused',
    pickupLocation: row.pickup_location,
  }));
}

export async function createNewListing(payload: CreateListingPayload): Promise<DatabaseListing> {
  return apiRequest<DatabaseListing>('/api/v1/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateExistingListing(
  listingId: number,
  payload: Partial<CreateListingPayload>
): Promise<DatabaseListing> {
  return apiRequest<DatabaseListing>(`/api/v1/listings/${listingId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteExistingListing(listingId: number): Promise<void> {
  await apiRequest<{ status: string }>(`/api/v1/listings/${listingId}`, {
    method: 'DELETE',
  });
}

// 3. Booking API calls
export async function createBookingRequest(payload: CreateBookingPayload): Promise<DatabaseBooking> {
  return apiRequest<DatabaseBooking>('/api/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBookingDecision(
  bookingId: number,
  bookingStatus: 'approved' | 'declined' | 'returned'
): Promise<DatabaseBooking> {
  return apiRequest<DatabaseBooking>(`/api/v1/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ booking_status: bookingStatus }),
  });
}

export async function fetchOwnerBookingRequests(): Promise<OwnerRentalRequest[]> {
  const [rows, profileMap] = await Promise.all([
    apiRequest<DatabaseBooking[]>('/api/v1/bookings/owner'),
    fetchPublicProfileMap(),
  ]);

  return rows
    .filter((row) => row.listings !== undefined)
    .map((row) => {
      const renterProfile = profileMap[row.renter_id];
      return {
        id: `booking-${row.id}`,
        bookingId: row.id,
        item: mapDatabaseListingToRentalItem(row.listings as DatabaseListing, profileMap),
        renterName: renterProfile?.full_name || 'Verified Campus Student',
        renterDepartment: renterProfile?.institution || 'Campus Peer',
        requestedDates: `${row.start_date} to ${row.end_date}`,
        durationDays: calculateInclusiveDays(row.start_date, row.end_date) || 1,
        totalPrice: row.total_price,
        status: row.booking_status,
      };
    });
}

const RENTER_STATUS_LABELS: Record<DatabaseBooking['booking_status'], string> = {
  pending: 'Pending Owner Approval',
  approved: 'Approved · Active Rental',
  declined: 'Declined by Owner',
  returned: 'Completed & Returned',
};

export async function fetchMyRenterBookings(): Promise<ActivePeerRental[]> {
  const [rows, profileMap] = await Promise.all([
    apiRequest<DatabaseBooking[]>('/api/v1/bookings/renter'),
    fetchPublicProfileMap(),
  ]);

  return rows
    .filter((row) => row.listings !== undefined)
    .map((row) => {
      const item = mapDatabaseListingToRentalItem(row.listings as DatabaseListing, profileMap);
      return {
        id: `rental-${row.id}`,
        item,
        renterCampusArea: item.pickupLocation || 'Campus',
        dateRange: `${row.start_date} to ${row.end_date}`,
        totalPrice: row.total_price,
        durationDays: calculateInclusiveDays(row.start_date, row.end_date) || 1,
        statusLabel: RENTER_STATUS_LABELS[row.booking_status],
        bookingStatus: row.booking_status,
      };
    });
}
