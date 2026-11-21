#ifndef HEALTH_CONTROLLER_CPP
#define HEALTH_CONTROLLER_CPP

#include <iostream>
#include <string>
#include "supabase_client.h"

using namespace std;

// ============================================================================
// CLASS: HttpRequest
// Purpose: Stores basic details of an incoming HTTP request (method and path).
// ============================================================================
class HttpRequest {
private:
    string method;    // e.g., "GET", "POST"
    string path;      // e.g., "/api/v1/health"
    string body;      // Request body text
    string authToken; // Optional Bearer token from Authorization header

public:
    // Default constructor
    HttpRequest() {
        method = "";
        path = "";
        body = "";
        authToken = "";
    }

    // Parameterized constructor
    HttpRequest(string reqMethod, string reqPath, string reqBody, string reqAuthToken = "") {
        method = reqMethod;
        path = reqPath;
        body = reqBody;
        authToken = reqAuthToken;
    }

    // Getter functions (Encapsulation)
    string getMethod() const { return method; }
    string getPath() const { return path; }
    string getBody() const { return body; }
    string getAuthToken() const { return authToken; }
};

// ============================================================================
// CLASS: HttpResponse
// Purpose: Stores the HTTP status code and JSON body to send back to client.
// ============================================================================
class HttpResponse {
private:
    int statusCode;     // e.g., 200 for OK, 404 for Not Found
    string contentType; // e.g., "application/json"
    string body;        // JSON string response

public:
    // Default constructor
    HttpResponse() {
        statusCode = 200;
        contentType = "application/json";
        body = "{}";
    }

    // Sets the JSON string and status code for the response
    void setJsonResponse(string jsonText, int code = 200) {
        body = jsonText;
        statusCode = code;
        contentType = "application/json";
    }

    // Getter functions
    int getStatusCode() const { return statusCode; }
    string getContentType() const { return contentType; }
    string getBody() const { return body; }
};

// ============================================================================
// ABSTRACT CLASS: ApiController
// Purpose: Base class for all API controllers using pure virtual functions.
// Demonstrates Abstraction and Inheritance.
// ============================================================================
class ApiController {
public:
    // Virtual destructor for safe cleanup when using base class pointers
    virtual ~ApiController() {}

    // Checks if this controller matches the request method and URL path
    virtual bool canHandle(string method, string path) const = 0;

    // Processes the HTTP request and writes data into the HTTP response
    virtual void handleRequest(const HttpRequest& request, HttpResponse& response) = 0;
};

// ============================================================================
// DERIVED CLASS: HealthController
// Purpose: Handles GET /api/v1/health and returns backend status in JSON.
// ============================================================================
class HealthController : public ApiController {
private:
    string serviceName;
    string cppStandard;
    string version;

public:
    // Constructor to initialize service information
    HealthController(string name, string standardVersion, string appVersion) {
        serviceName = name;
        cppStandard = standardVersion;
        version = appVersion;
    }

    // Checks if the request is GET /api/v1/health
    bool canHandle(string method, string path) const override {
        if (method == "GET" && path == "/api/v1/health") {
            return true;
        }
        return false;
    }

    // Creates the JSON response for the health endpoint
    void handleRequest(const HttpRequest& request, HttpResponse& response) override {
        string reqPath = request.getPath(); // Read path from request object

        string json = "{\n"
                      "  \"status\": \"ok\",\n"
                      "  \"service\": \"" + serviceName + "\",\n"
                      "  \"language\": \"C++\",\n"
                      "  \"standard\": \"" + cppStandard + "\",\n"
                      "  \"version\": \"" + version + "\",\n"
                      "  \"endpoint\": \"" + reqPath + "\"\n"
                      "}";

        response.setJsonResponse(json, 200);
    }
};

// ============================================================================
// DERIVED CLASS: DatabaseHealthController
// Purpose: Handles GET /api/v1/db-health to verify live connectivity to
//          Supabase PostgreSQL without exposing keys, tokens, or raw rows.
// ============================================================================
class DatabaseHealthController : public ApiController {
private:
    SupabaseClient* supabaseClient;

public:
    DatabaseHealthController(SupabaseClient* clientPtr) {
        supabaseClient = clientPtr;
    }

    bool canHandle(string method, string path) const override {
        return method == "GET" && path == "/api/v1/db-health";
    }

    void handleRequest(const HttpRequest& request, HttpResponse& response) override {
        if (supabaseClient == nullptr || !supabaseClient->isConfigured()) {
            string configErrorJson = "{\n"
                                     "  \"status\": \"error\",\n"
                                     "  \"database\": \"unconfigured\",\n"
                                     "  \"message\": \"Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY configuration.\"\n"
                                     "}";
            response.setJsonResponse(configErrorJson, 500);
            return;
        }

        SupabaseResponse dbRes = supabaseClient->sendRequest(
            "GET",
            "/rest/v1/listings?select=id&limit=1",
            "",
            request.getAuthToken()
        );

        if (dbRes.isSuccess()) {
            string okJson = "{\n"
                            "  \"status\": \"ok\",\n"
                            "  \"database\": \"connected\",\n"
                            "  \"service\": \"supabase-postgrest\",\n"
                            "  \"supabaseStatus\": " + to_string(dbRes.statusCode) + ",\n"
                            "  \"endpoint\": \"/api/v1/db-health\"\n"
                            "}";
            response.setJsonResponse(okJson, 200);
        } else {
            string errMsg = dbRes.errorMessage.empty() ? "Supabase returned non-2xx status." : dbRes.errorMessage;
            string failJson = "{\n"
                              "  \"status\": \"error\",\n"
                              "  \"database\": \"unreachable\",\n"
                              "  \"supabaseStatus\": " + to_string(dbRes.statusCode) + ",\n"
                              "  \"message\": \"" + errMsg + "\"\n"
                              "}";
            response.setJsonResponse(failJson, 502);
        }
    }
};

#endif
