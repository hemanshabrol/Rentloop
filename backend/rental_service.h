#ifndef RENTAL_SERVICE_H
#define RENTAL_SERVICE_H

// ============================================================================
// FILE: rental_service.h
// Purpose: Declares the RentalService class, which coordinates Listing,
//          Booking, and Student OOP objects and persists data through
//          SupabaseClient.
// ============================================================================

#include <string>
#include "models.h"
#include "supabase_client.h"

using namespace std;

class RentalService {
private:
    SupabaseClient* supabaseClient;

    // Loads a single Listing object from Supabase by ID
    Listing fetchListingObject(long long listingId, const string& bearerToken) const;

public:
    RentalService(SupabaseClient* clientPtr);

    // Verifies the Bearer token with Supabase and returns the authenticated Student object
    Student getAuthenticatedStudent(const string& bearerToken) const;

    // Listing operations
    SupabaseResponse getAvailableListings(const string& bearerToken) const;
    SupabaseResponse getListingById(long long listingId, const string& bearerToken) const;
    SupabaseResponse getMyListings(const string& bearerToken) const;
    SupabaseResponse createListing(const string& requestBody, const string& bearerToken) const;
    SupabaseResponse updateListing(long long listingId, const string& requestBody, const string& bearerToken) const;
    SupabaseResponse deleteListing(long long listingId, const string& bearerToken) const;

    // Booking / Rental operations
    SupabaseResponse getBookings(const string& roleFilter, const string& bearerToken) const;
    SupabaseResponse createBookingRequest(const string& requestBody, const string& bearerToken) const;
    SupabaseResponse updateBookingStatus(long long bookingId, const string& requestBody, const string& bearerToken) const;
};

#endif

