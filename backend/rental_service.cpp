#ifndef RENTAL_SERVICE_CPP
#define RENTAL_SERVICE_CPP

// ============================================================================
// FILE: rental_service.cpp
// Purpose: Implements RentalService business logic using Student, Listing, and
//          Booking OOP domain objects and SupabaseClient.
// ============================================================================

#include "rental_service.h"
#include <stdexcept>

using namespace std;

const string LISTING_SELECT_QUERY =
    "/rest/v1/listings?select=id,owner_id,item_name,category,brand_model,description,"
    "condition,daily_price,pickup_location,availability_status,created_at,"
    "listing_images(id,listing_id,image_url,display_order)";

RentalService::RentalService(SupabaseClient* clientPtr) : supabaseClient(clientPtr) {}

// Verifies the student's JWT with Supabase and returns a Student object
Student RentalService::getAuthenticatedStudent(const string& bearerToken) const {
    if (bearerToken.empty()) {
        throw runtime_error("401:Authentication required. Missing Bearer token.");
    }
    if (supabaseClient == nullptr || !supabaseClient->isConfigured()) {
        throw runtime_error("500:Backend Supabase client is not configured.");
    }

    SupabaseResponse res = supabaseClient->sendRequest(
        "GET", "/rest/v1/profiles?select=id,full_name,email,phone,institution", "", bearerToken
    );

    if (res.statusCode == 401 || res.statusCode == 403) {
        throw runtime_error("401:Invalid or expired authentication token.");
    }
    if (!res.isSuccess()) {
        throw runtime_error("502:Failed to verify student profile with Supabase.");
    }

    string obj = JsonHelper::extractFirstObject(res.body);
    if (obj.empty()) throw runtime_error("404:Student profile not found.");

    return Student(
        JsonHelper::getString(obj, "id"),
        JsonHelper::getString(obj, "full_name"),
        JsonHelper::getString(obj, "email"),
        JsonHelper::getString(obj, "phone"),
        JsonHelper::getString(obj, "institution")
    );
}

// Loads a single Listing object from Supabase by ID
Listing RentalService::fetchListingObject(long long listingId, const string& bearerToken) const {
    string query = "/rest/v1/listings?select=id,owner_id,item_name,category,brand_model,description,"
                   "condition,daily_price,pickup_location,availability_status&id=eq." + to_string(listingId);
    SupabaseResponse res = supabaseClient->sendRequest("GET", query, "", bearerToken);
    if (!res.isSuccess()) throw runtime_error("502:Failed to fetch listing from database.");

    string obj = JsonHelper::extractFirstObject(res.body);
    if (obj.empty()) throw runtime_error("404:Listing not found.");

    return Listing::fromJson(obj);
}

SupabaseResponse RentalService::getAvailableListings(const string& bearerToken) const {
    string query = LISTING_SELECT_QUERY +
                   "&availability_status=eq.available&order=created_at.desc,id.asc&listing_images.order=display_order.asc";
    return supabaseClient->sendRequest("GET", query, "", bearerToken);
}

SupabaseResponse RentalService::getListingById(long long listingId, const string& bearerToken) const {
    string query = LISTING_SELECT_QUERY + "&id=eq." + to_string(listingId) + "&listing_images.order=display_order.asc";
    return supabaseClient->sendRequest("GET", query, "", bearerToken);
}

SupabaseResponse RentalService::getMyListings(const string& bearerToken) const {
    Student owner = getAuthenticatedStudent(bearerToken);
    string query = LISTING_SELECT_QUERY + "&owner_id=eq." + owner.getId() +
                   "&order=created_at.desc,id.desc&listing_images.order=display_order.asc";
    return supabaseClient->sendRequest("GET", query, "", bearerToken);
}

// Creates a new listing and batch-inserts its listing_images using the Listing OOP model
SupabaseResponse RentalService::createListing(const string& requestBody, const string& bearerToken) const {
    Student owner = getAuthenticatedStudent(bearerToken);

    string photoUrls[MAX_LISTING_IMAGES];
    int photoCount = JsonHelper::getStringArray(requestBody, "images", photoUrls, MAX_LISTING_IMAGES);

    Listing newListing = Listing::fromJson(requestBody, owner.getId());
    newListing.setImages(photoUrls, photoCount);
    newListing.validate(true);

    SupabaseResponse insertRes = supabaseClient->sendRequest(
        "POST", "/rest/v1/listings", newListing.toJsonPayload(true), bearerToken
    );
    if (!insertRes.isSuccess()) return insertRes;

    string createdObj = JsonHelper::extractFirstObject(insertRes.body);
    long long createdId = JsonHelper::getLongLong(createdObj, "id");

    if (newListing.getImageCount() > 0) {
        supabaseClient->sendRequest(
            "POST", "/rest/v1/listing_images", newListing.buildImagesJsonPayload(createdId), bearerToken
        );
    }

    string fullObj = JsonHelper::extractFirstObject(getListingById(createdId, bearerToken).body);
    return SupabaseResponse(201, fullObj.empty() ? createdObj : fullObj);
}

// Updates an existing listing (full edit or pause/reactivate) after verifying ownership
SupabaseResponse RentalService::updateListing(
    long long listingId, const string& requestBody, const string& bearerToken
) const {
    Student owner = getAuthenticatedStudent(bearerToken);
    Listing existing = fetchListingObject(listingId, bearerToken);

    if (!existing.isOwnedBy(owner.getId())) {
        throw runtime_error("403:You do not have permission to modify another student's listing.");
    }

    existing.updateDetails(
        JsonHelper::getString(requestBody, "item_name", existing.getItemName()),
        JsonHelper::getString(requestBody, "category", existing.getCategory()),
        JsonHelper::getString(requestBody, "brand_model", existing.getBrandModel()),
        JsonHelper::getString(requestBody, "description", existing.getDescription()),
        JsonHelper::getString(requestBody, "condition", existing.getCondition()),
        JsonHelper::getInt(requestBody, "daily_price", existing.getDailyPrice()),
        JsonHelper::getString(requestBody, "pickup_location", existing.getPickupLocation()),
        JsonHelper::getString(requestBody, "availability_status", existing.getAvailabilityStatus())
    );

    SupabaseResponse patchRes = supabaseClient->sendRequest(
        "PATCH", "/rest/v1/listings?id=eq." + to_string(listingId), existing.toJsonPayload(false), bearerToken
    );
    if (!patchRes.isSuccess()) return patchRes;

    string photoUrls[MAX_LISTING_IMAGES];
    int photoCount = JsonHelper::getStringArray(requestBody, "images", photoUrls, MAX_LISTING_IMAGES);
    if (photoCount > 0) {
        existing.setImages(photoUrls, photoCount);
        supabaseClient->sendRequest("DELETE", "/rest/v1/listing_images?listing_id=eq." + to_string(listingId), "", bearerToken);
        supabaseClient->sendRequest("POST", "/rest/v1/listing_images", existing.buildImagesJsonPayload(listingId), bearerToken);
    }

    string updatedObj = JsonHelper::extractFirstObject(getListingById(listingId, bearerToken).body);
    return SupabaseResponse(200, updatedObj.empty() ? "{}" : updatedObj);
}

// Deletes a listing owned by the authenticated student
SupabaseResponse RentalService::deleteListing(long long listingId, const string& bearerToken) const {
    Student owner = getAuthenticatedStudent(bearerToken);
    Listing existing = fetchListingObject(listingId, bearerToken);

    if (!existing.isOwnedBy(owner.getId())) {
        throw runtime_error("403:You do not have permission to delete another student's listing.");
    }

    SupabaseResponse delRes = supabaseClient->sendRequest(
        "DELETE", "/rest/v1/listings?id=eq." + to_string(listingId), "", bearerToken
    );
    if (!delRes.isSuccess()) return delRes;

    return SupabaseResponse(200, "{\"status\":\"ok\",\"deletedId\":" + to_string(listingId) + "}");
}

// Fetches bookings for the authenticated student (roleFilter: "owner" or "renter")
SupabaseResponse RentalService::getBookings(const string& roleFilter, const string& bearerToken) const {
    Student student = getAuthenticatedStudent(bearerToken);

    string query =
        "/rest/v1/bookings?select=id,listing_id,renter_id,start_date,end_date,daily_price,total_price,booking_status,created_at,"
        "listings!inner(id,owner_id,item_name,category,brand_model,daily_price,pickup_location,availability_status,"
        "listing_images(id,listing_id,image_url,display_order))&order=created_at.desc,id.desc";

    if (roleFilter == "owner") query += "&listings.owner_id=eq." + student.getId();
    else if (roleFilter == "renter") query += "&renter_id=eq." + student.getId();

    return supabaseClient->sendRequest("GET", query, "", bearerToken);
}

// Creates a new booking request using Listing and Booking OOP validation
SupabaseResponse RentalService::createBookingRequest(const string& requestBody, const string& bearerToken) const {
    Student renter = getAuthenticatedStudent(bearerToken);
    Listing targetListing = fetchListingObject(JsonHelper::getLongLong(requestBody, "listing_id"), bearerToken);

    if (targetListing.isOwnedBy(renter.getId())) {
        throw invalid_argument("You cannot rent your own listing.");
    }
    if (!targetListing.isAvailable()) {
        throw invalid_argument("This listing is currently paused and not accepting booking requests.");
    }

    Booking newBooking(
        0, targetListing.getId(), renter.getId(),
        JsonHelper::getString(requestBody, "start_date"),
        JsonHelper::getString(requestBody, "end_date"),
        targetListing.getDailyPrice(), "pending"
    );
    newBooking.validateNewRequest(JsonHelper::getTodayDate());

    string payload =
        "{\"listing_id\":" + to_string(newBooking.getListingId()) +
        ",\"renter_id\":\"" + JsonHelper::escape(newBooking.getRenterId()) +
        "\",\"start_date\":\"" + JsonHelper::escape(newBooking.getStartDate()) +
        "\",\"end_date\":\"" + JsonHelper::escape(newBooking.getEndDate()) +
        "\",\"daily_price\":" + to_string(newBooking.getDailyPrice()) +
        ",\"total_price\":" + to_string(newBooking.getTotalPrice()) +
        ",\"booking_status\":\"pending\"}";

    SupabaseResponse insertRes = supabaseClient->sendRequest("POST", "/rest/v1/bookings", payload, bearerToken);
    if (!insertRes.isSuccess()) {
        throw runtime_error("400:" + JsonHelper::getString(insertRes.body, "message", "Failed to create booking request."));
    }

    string createdObj = JsonHelper::extractFirstObject(insertRes.body);
    return SupabaseResponse(201, createdObj.empty() ? insertRes.body : createdObj);
}

// Coordinates booking approval, rejection, and return transitions via Booking OOP methods
SupabaseResponse RentalService::updateBookingStatus(
    long long bookingId, const string& requestBody, const string& bearerToken
) const {
    Student owner = getAuthenticatedStudent(bearerToken);

    string fetchQuery =
        "/rest/v1/bookings?select=id,listing_id,renter_id,start_date,end_date,daily_price,total_price,booking_status,"
        "listings!inner(id,owner_id,item_name,category,brand_model,description,condition,daily_price,pickup_location,availability_status)"
        "&id=eq." + to_string(bookingId);

    SupabaseResponse fetchRes = supabaseClient->sendRequest("GET", fetchQuery, "", bearerToken);
    if (!fetchRes.isSuccess()) throw runtime_error("502:Failed to fetch booking from database.");

    string bookingObj = JsonHelper::extractFirstObject(fetchRes.body);
    size_t listingsKeyPos = bookingObj.find("\"listings\"");
    string listingObj = (listingsKeyPos != string::npos)
                            ? JsonHelper::extractFirstObject(bookingObj.substr(listingsKeyPos))
                            : "";
    if (bookingObj.empty() || listingObj.empty()) throw runtime_error("404:Booking not found.");

    Booking booking(
        JsonHelper::getLongLong(bookingObj, "id"),
        JsonHelper::getLongLong(bookingObj, "listing_id"),
        JsonHelper::getString(bookingObj, "renter_id"),
        JsonHelper::getString(bookingObj, "start_date"),
        JsonHelper::getString(bookingObj, "end_date"),
        JsonHelper::getInt(bookingObj, "daily_price"),
        JsonHelper::getString(bookingObj, "booking_status", "pending")
    );
    Listing listing = Listing::fromJson(listingObj);

    if (!listing.isOwnedBy(owner.getId())) {
        throw runtime_error("403:Only the listing owner can approve, decline, or update this booking.");
    }

    string desiredStatus = JsonHelper::getString(requestBody, "booking_status");
    if (desiredStatus == "approved") {
        if (!listing.isAvailable()) {
            throw invalid_argument("Cannot approve a booking while the listing is paused.");
        }
        booking.approve();
    } else if (desiredStatus == "declined") {
        booking.reject();
    } else if (desiredStatus == "returned") {
        booking.markReturned();
    } else {
        throw invalid_argument("Unsupported booking status. Allowed values: 'approved', 'declined', 'returned'.");
    }

    string patchPayload = "{\"booking_status\":\"" + booking.getBookingStatus() + "\"}";
    SupabaseResponse patchRes = supabaseClient->sendRequest(
        "PATCH", "/rest/v1/bookings?id=eq." + to_string(bookingId), patchPayload, bearerToken
    );

    if (!patchRes.isSuccess()) {
        if (patchRes.statusCode == 409 || patchRes.body.find("bookings_no_overlapping_approved") != string::npos) {
            throw invalid_argument("Cannot approve booking: these dates overlap with an already approved booking for this listing.");
        }
        throw runtime_error("400:" + JsonHelper::getString(patchRes.body, "message", "Failed to update booking status."));
    }

    string updatedObj = JsonHelper::extractFirstObject(patchRes.body);
    return SupabaseResponse(200, updatedObj.empty() ? patchPayload : updatedObj);
}

#endif
