#ifndef SUPABASE_CLIENT_H
#define SUPABASE_CLIENT_H

// ============================================================================
// FILE: supabase_client.h
// Purpose: Class declarations for SupabaseResponse and SupabaseClient.
// ============================================================================

#include <winsock2.h>
#include <windows.h>
#include <winhttp.h>
#include <string>

using namespace std;

// Stores the HTTP status code, response body, and error message from Supabase
class SupabaseResponse {
public:
    int statusCode;
    string body;
    string errorMessage;

    SupabaseResponse();
    SupabaseResponse(int code, string responseBody, string error = "");
    bool isSuccess() const;
};

// Handles HTTPS communication with the Supabase PostgREST API using WinHTTP
class SupabaseClient {
private:
    string projectUrl;
    string hostName;
    string publishableKey;
    HINTERNET hSession;
    DWORD sessionInitError;

    string trimValue(const string& text) const;
    string extractHostName(const string& url) const;
    wstring toWideString(const string& text) const;
    void loadEnvFile(const string& filePath);
    void closeHandles(HINTERNET hRequest, HINTERNET hConnect) const;
    string readResponseBody(HINTERNET hRequest) const;

public:
    SupabaseClient();
    ~SupabaseClient();

    // Prevent copying to avoid double-closing the persistent WinHTTP session handle
    SupabaseClient(const SupabaseClient&) = delete;
    SupabaseClient& operator=(const SupabaseClient&) = delete;

    bool isConfigured() const;

    SupabaseResponse sendRequest(
        const string& method,
        const string& restPath,
        const string& requestBody = "",
        const string& bearerToken = ""
    ) const;
};

#endif
