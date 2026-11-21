// ============================================================================
// FILE: api.ts
// Purpose: TypeScript interfaces matching the C++17 REST API and Supabase
//          PostgreSQL schema (public_profiles, listings, listing_images,
//          and bookings).
// ============================================================================

export interface HealthResponse {
  status: string;
  service: string;
  language: string;
  standard: string;
  version: string;
}

export interface PublicProfile {
  id: string;
  full_name: string;
  institution: string;
}

export interface DatabaseListingImage {
  id: number;
  listing_id: number;
  image_url: string;
  display_order: number;
}

export interface DatabaseListing {
  id: number;
  owner_id: string;
  item_name: string;
  category: string;
  brand_model: string | null;
  description: string;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair';
  daily_price: number;
  pickup_location: string;
  availability_status: 'available' | 'paused';
  created_at: string;
  listing_images?: DatabaseListingImage[];
}

export interface CreateListingPayload {
  item_name: string;
  category: string;
  brand_model?: string;
  description: string;
  condition: string;
  daily_price: number;
  pickup_location: string;
  availability_status: 'available' | 'paused';
  images?: string[];
}

export interface DatabaseBooking {
  id: number;
  listing_id: number;
  renter_id: string;
  start_date: string;
  end_date: string;
  daily_price: number;
  total_price: number;
  booking_status: 'pending' | 'approved' | 'declined' | 'returned';
  created_at: string;
  listings?: DatabaseListing;
}

export interface CreateBookingPayload {
  listing_id: number;
  start_date: string;
  end_date: string;
}
