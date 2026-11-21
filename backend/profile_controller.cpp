#ifndef PROFILE_CONTROLLER_CPP
#define PROFILE_CONTROLLER_CPP

// ============================================================================
// FILE: profile_controller.cpp
// Purpose: Handles student profile endpoints:
//          - GET /api/v1/profile/me       (authenticated student's own profile)
//          - GET /api/v1/public-profiles  (public_profiles view: id, full_name, institution)
// ============================================================================

#include <string>
#include "health_controller.cpp"
#include "models.h"
#include "supabase_client.h"

using namespace std;

class ProfileController : public ApiController {
private:
    SupabaseClient* supabaseClient;

public:
    ProfileController(SupabaseClient* clientPtr) {
        supabaseClient = clientPtr;
    }

    bool canHandle(string method, string path) const override {
        return method == "GET" && (path == "/api/v1/profile/me" || path == "/api/v1/public-profiles");
    }

    void handleRequest(const HttpRequest& request, HttpResponse& response) override {
        string bearerToken = request.getAuthToken();

        if (bearerToken.empty()) {
            response.setJsonResponse(
                "{\"status\":\"error\",\"message\":\"Authentication required. Missing Bearer token.\"}",
                401
            );
            return;
        }

        if (supabaseClient == nullptr || !supabaseClient->isConfigured()) {
            response.setJsonResponse(
                "{\"status\":\"error\",\"message\":\"Backend Supabase client is not configured.\"}",
                500
            );
            return;
        }

        // Public campus directory lookup (exposes only id, full_name, institution via public_profiles view)
        if (request.getPath() == "/api/v1/public-profiles") {
            SupabaseResponse dirRes = supabaseClient->sendRequest(
                "GET",
                "/rest/v1/public_profiles?select=id,full_name,institution",
                "",
                bearerToken
            );
            if (dirRes.statusCode == 401 || dirRes.statusCode == 403) {
                response.setJsonResponse("{\"status\":\"error\",\"message\":\"Invalid or expired authentication token.\"}", 401);
                return;
            }
            if (!dirRes.isSuccess()) {
                response.setJsonResponse("[]", 200);
                return;
            }
            response.setJsonResponse(dirRes.body.empty() ? "[]" : dirRes.body, 200);
            return;
        }

        // Own profile lookup (ownership enforced by Supabase RLS: auth.uid() = id)
        SupabaseResponse dbRes = supabaseClient->sendRequest(
            "GET",
            "/rest/v1/profiles?select=id,full_name,email,phone,institution,created_at",
            "",
            bearerToken
        );

        if (dbRes.statusCode == 401 || dbRes.statusCode == 403) {
            response.setJsonResponse(
                "{\"status\":\"error\",\"message\":\"Invalid or expired authentication token.\"}",
                401
            );
            return;
        }

        if (!dbRes.isSuccess()) {
            response.setJsonResponse(
                "{\"status\":\"error\",\"message\":\"Failed to fetch student profile from Supabase.\"}",
                502
            );
            return;
        }

        string profileObject = JsonHelper::extractFirstObject(dbRes.body);
        if (profileObject.empty()) {
            response.setJsonResponse(
                "{\"status\":\"error\",\"message\":\"Profile not found for authenticated student.\"}",
                404
            );
            return;
        }

        response.setJsonResponse(profileObject, 200);
    }
};

#endif
