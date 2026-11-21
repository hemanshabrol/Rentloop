#ifndef LISTINGS_CONTROLLER_CPP
#define LISTINGS_CONTROLLER_CPP

// ============================================================================
// FILE: listings_controller.cpp
// Purpose: HTTP API controllers for Listings and Bookings.
//          Delegates business logic and validation to RentalService (which
//          executes through Student, Listing, and Booking C++ OOP classes).
// ============================================================================

#include <stdexcept>
#include <string>
#include "health_controller.cpp"
#include "rental_service.h"

using namespace std;

// Helper to convert exception messages (including "401:...", "403:...", "404:...") into HTTP JSON responses
inline void handleExceptionResponse(const exception& ex, int defaultCode, HttpResponse& response) {
    string raw = ex.what();
    int statusCode = defaultCode;
    string message = raw;

    if (raw.length() > 4 && raw[3] == ':') {
        try {
            statusCode = stoi(raw.substr(0, 3));
            message = raw.substr(4);
        } catch (...) {
            statusCode = defaultCode;
        }
    }

    string errJson = "{\"status\":\"error\",\"message\":\"" + JsonHelper::escape(message) + "\"}";
    response.setJsonResponse(errJson, statusCode);
}

// Helper to parse a positive integer resource ID from a URL path like "/api/v1/listings/12"
inline bool parseResourceIdFromPath(const string& path, const string& prefix, long long& outId) {
    if (path.find(prefix) != 0) {
        return false;
    }
    string idPart = path.substr(prefix.length());
    if (idPart.empty()) return false;
    for (size_t i = 0; i < idPart.length(); i++) {
        if (idPart[i] < '0' || idPart[i] > '9') {
            return false;
        }
    }
    try {
        outId = stoll(idPart);
        return outId > 0;
    } catch (...) {
        return false;
    }
}

// ============================================================================
// CLASS: ListingsController
// Routes:
//   - GET    /api/v1/listings        (all available marketplace listings)
//   - GET    /api/v1/listings/my     (authenticated student's own listings)
//   - GET    /api/v1/listings/:id    (single listing details by ID)
//   - POST   /api/v1/listings        (create a new listing)
//   - PUT    /api/v1/listings/:id    (edit or pause/reactivate a listing)
//   - PATCH  /api/v1/listings/:id    (edit or pause/reactivate a listing)
//   - DELETE /api/v1/listings/:id    (remove a listing)
// ============================================================================
class ListingsController : public ApiController {
private:
    RentalService* rentalService;

public:
    ListingsController(RentalService* servicePtr) {
        rentalService = servicePtr;
    }

    bool canHandle(string method, string path) const override {
        if (path == "/api/v1/listings" && (method == "GET" || method == "POST")) {
            return true;
        }
        if (path == "/api/v1/listings/my" && method == "GET") {
            return true;
        }
        long long id = 0;
        if (parseResourceIdFromPath(path, "/api/v1/listings/", id) &&
            (method == "GET" || method == "PUT" || method == "PATCH" || method == "DELETE")) {
            return true;
        }
        return false;
    }

    void handleRequest(const HttpRequest& request, HttpResponse& response) override {
        try {
            string method = request.getMethod();
            string path = request.getPath();
            string token = request.getAuthToken();

            if (method == "GET" && path == "/api/v1/listings") {
                SupabaseResponse res = rentalService->getAvailableListings(token);
                if (!res.isSuccess()) {
                    throw runtime_error("502:Failed to retrieve marketplace listings.");
                }
                response.setJsonResponse(res.body.empty() ? "[]" : res.body, 200);
                return;
            }

            if (method == "GET" && path == "/api/v1/listings/my") {
                SupabaseResponse res = rentalService->getMyListings(token);
                if (!res.isSuccess()) {
                    throw runtime_error("502:Failed to retrieve your listings.");
                }
                response.setJsonResponse(res.body.empty() ? "[]" : res.body, 200);
                return;
            }

            if (method == "POST" && path == "/api/v1/listings") {
                SupabaseResponse res = rentalService->createListing(request.getBody(), token);
                if (!res.isSuccess()) {
                    string dbErr = JsonHelper::getString(res.body, "message", "Failed to create listing.");
                    throw runtime_error("400:" + dbErr);
                }
                response.setJsonResponse(res.body, 201);
                return;
            }

            long long listingId = 0;
            if (parseResourceIdFromPath(path, "/api/v1/listings/", listingId)) {
                if (method == "GET") {
                    SupabaseResponse res = rentalService->getListingById(listingId, token);
                    string singleListing = res.isSuccess() ? JsonHelper::extractFirstObject(res.body) : "";
                    if (singleListing.empty()) {
                        throw runtime_error("404:Listing not found.");
                    }
                    response.setJsonResponse(singleListing, 200);
                    return;
                }

                if (method == "PUT" || method == "PATCH") {
                    SupabaseResponse res = rentalService->updateListing(listingId, request.getBody(), token);
                    if (!res.isSuccess()) {
                        string dbErr = JsonHelper::getString(res.body, "message", "Failed to update listing.");
                        throw runtime_error("400:" + dbErr);
                    }
                    response.setJsonResponse(res.body, 200);
                    return;
                }

                if (method == "DELETE") {
                    SupabaseResponse res = rentalService->deleteListing(listingId, token);
                    if (!res.isSuccess()) {
                        throw runtime_error("400:Failed to delete listing.");
                    }
                    response.setJsonResponse(res.body, 200);
                    return;
                }
            }
        } catch (const invalid_argument& ex) {
            handleExceptionResponse(ex, 400, response);
        } catch (const logic_error& ex) {
            handleExceptionResponse(ex, 400, response);
        } catch (const exception& ex) {
            handleExceptionResponse(ex, 500, response);
        }
    }
};

// ============================================================================
// CLASS: BookingsController
// Routes:
//   - GET   /api/v1/bookings/owner   (incoming requests & active rentals for owner)
//   - GET   /api/v1/bookings/renter  (bookings requested by logged-in renter)
//   - POST  /api/v1/bookings         (submit a new booking request)
//   - PATCH /api/v1/bookings/:id     (approve, decline, or mark returned)
//   - PUT   /api/v1/bookings/:id     (approve, decline, or mark returned)
// ============================================================================
class BookingsController : public ApiController {
private:
    RentalService* rentalService;

public:
    BookingsController(RentalService* servicePtr) {
        rentalService = servicePtr;
    }

    bool canHandle(string method, string path) const override {
        if (method == "GET" && (path == "/api/v1/bookings/owner" || path == "/api/v1/bookings/renter")) {
            return true;
        }
        if (method == "POST" && path == "/api/v1/bookings") {
            return true;
        }
        long long id = 0;
        if (parseResourceIdFromPath(path, "/api/v1/bookings/", id) && (method == "PATCH" || method == "PUT")) {
            return true;
        }
        return false;
    }

    void handleRequest(const HttpRequest& request, HttpResponse& response) override {
        try {
            string method = request.getMethod();
            string path = request.getPath();
            string token = request.getAuthToken();

            if (method == "GET" && path == "/api/v1/bookings/owner") {
                SupabaseResponse res = rentalService->getBookings("owner", token);
                if (!res.isSuccess()) {
                    throw runtime_error("502:Failed to retrieve owner booking requests.");
                }
                response.setJsonResponse(res.body.empty() ? "[]" : res.body, 200);
                return;
            }

            if (method == "GET" && path == "/api/v1/bookings/renter") {
                SupabaseResponse res = rentalService->getBookings("renter", token);
                if (!res.isSuccess()) {
                    throw runtime_error("502:Failed to retrieve your rental bookings.");
                }
                response.setJsonResponse(res.body.empty() ? "[]" : res.body, 200);
                return;
            }

            if (method == "POST" && path == "/api/v1/bookings") {
                SupabaseResponse res = rentalService->createBookingRequest(request.getBody(), token);
                response.setJsonResponse(res.body, 201);
                return;
            }

            long long bookingId = 0;
            if (parseResourceIdFromPath(path, "/api/v1/bookings/", bookingId) && (method == "PATCH" || method == "PUT")) {
                SupabaseResponse res = rentalService->updateBookingStatus(bookingId, request.getBody(), token);
                response.setJsonResponse(res.body, 200);
                return;
            }
        } catch (const invalid_argument& ex) {
            handleExceptionResponse(ex, 400, response);
        } catch (const logic_error& ex) {
            handleExceptionResponse(ex, 400, response);
        } catch (const exception& ex) {
            handleExceptionResponse(ex, 500, response);
        }
    }
};

#endif
