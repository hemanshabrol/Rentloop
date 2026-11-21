#ifndef SUPABASE_CLIENT_CPP
#define SUPABASE_CLIENT_CPP

// ============================================================================
// FILE: supabase_client.cpp
// Purpose: Implements SupabaseResponse and SupabaseClient using Windows WinHTTP.
// ============================================================================

#include "supabase_client.h"
#include <cstdlib>
#include <fstream>

using namespace std;

// ============================================================================
// SupabaseResponse Implementation
// ============================================================================

SupabaseResponse::SupabaseResponse() {
    statusCode = 0;
    body = "";
    errorMessage = "";
}

SupabaseResponse::SupabaseResponse(int code, string responseBody, string error) {
    statusCode = code;
    body = responseBody;
    errorMessage = error;
}

bool SupabaseResponse::isSuccess() const {
    return statusCode >= 200 && statusCode < 300 && errorMessage.empty();
}

// ============================================================================
// SupabaseClient Implementation
// ============================================================================

// Removes leading/trailing spaces, tabs, carriage returns, and quotes
string SupabaseClient::trimValue(const string& text) const {
    size_t start = text.find_first_not_of(" \t\r\n\"'");
    if (start == string::npos) return "";
    size_t end = text.find_last_not_of(" \t\r\n\"'");
    return text.substr(start, end - start + 1);
}

// Extracts the domain host (e.g., "xyz.supabase.co") from a full https:// URL
string SupabaseClient::extractHostName(const string& url) const {
    string clean = trimValue(url);
    if (clean.find("https://") == 0) {
        clean = clean.substr(8);
    } else if (clean.find("http://") == 0) {
        clean = clean.substr(7);
    }

    size_t slashPos = clean.find('/');
    if (slashPos != string::npos) {
        clean = clean.substr(0, slashPos);
    }
    return clean;
}

// Converts standard string to wide string for WinHTTP functions
wstring SupabaseClient::toWideString(const string& text) const {
    return wstring(text.begin(), text.end());
}

// Reads SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY from a .env file
void SupabaseClient::loadEnvFile(const string& filePath) {
    ifstream envFile(filePath.c_str());
    if (!envFile.is_open()) return;

    string line;
    while (getline(envFile, line)) {
        if (line.empty() || line[0] == '#') continue;

        size_t equalPos = line.find('=');
        if (equalPos == string::npos) continue;

        string key = trimValue(line.substr(0, equalPos));
        string value = trimValue(line.substr(equalPos + 1));

        if ((key == "SUPABASE_URL" || key == "VITE_SUPABASE_URL") && projectUrl.empty()) {
            projectUrl = value;
        } else if ((key == "SUPABASE_PUBLISHABLE_KEY" || key == "VITE_SUPABASE_PUBLISHABLE_KEY") && publishableKey.empty()) {
            publishableKey = value;
        }
    }
}

// Safely closes per-request WinHTTP handles (persistent hSession is closed in destructor)
void SupabaseClient::closeHandles(HINTERNET hRequest, HINTERNET hConnect) const {
    if (hRequest != NULL) WinHttpCloseHandle(hRequest);
    if (hConnect != NULL) WinHttpCloseHandle(hConnect);
}

// Reads the HTTP response body from an active WinHTTP request handle
string SupabaseClient::readResponseBody(HINTERNET hRequest) const {
    string responseBody = "";
    DWORD bytesAvailable = 0;

    while (WinHttpQueryDataAvailable(hRequest, &bytesAvailable) && bytesAvailable > 0) {
        char buffer[4096];
        DWORD bytesToRead = bytesAvailable < sizeof(buffer) - 1 ? bytesAvailable : (DWORD)(sizeof(buffer) - 1);
        DWORD bytesRead = 0;

        if (WinHttpReadData(hRequest, buffer, bytesToRead, &bytesRead) && bytesRead > 0) {
            buffer[bytesRead] = '\0';
            responseBody += buffer;
        } else {
            break;
        }
    }
    return responseBody;
}

// Constructor loads Supabase configuration and initializes one persistent WinHTTP session
SupabaseClient::SupabaseClient() {
    hSession = NULL;
    sessionInitError = 0;

    const char* envUrl = getenv("SUPABASE_URL");
    if (envUrl == nullptr) envUrl = getenv("VITE_SUPABASE_URL");
    if (envUrl != nullptr) projectUrl = trimValue(envUrl);

    const char* envKey = getenv("SUPABASE_PUBLISHABLE_KEY");
    if (envKey == nullptr) envKey = getenv("VITE_SUPABASE_PUBLISHABLE_KEY");
    if (envKey != nullptr) publishableKey = trimValue(envKey);

    if (projectUrl.empty() || publishableKey.empty()) {
        loadEnvFile("backend/.env");
        loadEnvFile(".env");
        loadEnvFile("frontend/.env.local");
        loadEnvFile("../frontend/.env.local");
    }

    hostName = extractHostName(projectUrl);

    hSession = WinHttpOpen(
        L"RentLoop-Cpp-Backend/0.1",
        WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
        WINHTTP_NO_PROXY_NAME,
        WINHTTP_NO_PROXY_BYPASS,
        0
    );
    if (hSession == NULL) {
        sessionInitError = GetLastError();
    }
}

// Destructor closes the persistent WinHTTP session handle exactly once
SupabaseClient::~SupabaseClient() {
    if (hSession != NULL) {
        WinHttpCloseHandle(hSession);
        hSession = NULL;
    }
}

bool SupabaseClient::isConfigured() const {
    return !hostName.empty() && !publishableKey.empty();
}

// Sends an HTTPS request to Supabase PostgREST reusing the persistent WinHTTP session
SupabaseResponse SupabaseClient::sendRequest(
    const string& method,
    const string& restPath,
    const string& requestBody,
    const string& bearerToken
) const {
    if (!isConfigured()) {
        return SupabaseResponse(500, "", "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY.");
    }

    if (hSession == NULL) {
        return SupabaseResponse(502, "", "WinHttpOpen failed (error " + to_string(sessionInitError) + ").");
    }

    wstring wideHost = toWideString(hostName);
    HINTERNET hConnect = WinHttpConnect(hSession, wideHost.c_str(), INTERNET_DEFAULT_HTTPS_PORT, 0);
    if (hConnect == NULL) {
        DWORD errCode = GetLastError();
        return SupabaseResponse(502, "", "WinHttpConnect failed (error " + to_string(errCode) + ").");
    }

    wstring wideMethod = toWideString(method);
    wstring widePath = toWideString(restPath);
    HINTERNET hRequest = WinHttpOpenRequest(
        hConnect,
        wideMethod.c_str(),
        widePath.c_str(),
        NULL,
        WINHTTP_NO_REFERER,
        WINHTTP_DEFAULT_ACCEPT_TYPES,
        WINHTTP_FLAG_SECURE
    );
    if (hRequest == NULL) {
        DWORD errCode = GetLastError();
        closeHandles(NULL, hConnect);
        return SupabaseResponse(502, "", "WinHttpOpenRequest failed (error " + to_string(errCode) + ").");
    }

    // Send publishable key via apikey header.
    // Omit Authorization for anonymous requests; forward student JWT when present.
    string headerText = "apikey: " + publishableKey + "\r\n" +
                        "Content-Type: application/json\r\n" +
                        "Prefer: return=representation\r\n";
    if (!bearerToken.empty()) {
        headerText += "Authorization: Bearer " + bearerToken + "\r\n";
    }
    wstring wideHeaders = toWideString(headerText);

    LPVOID bodyPtr = requestBody.empty() ? WINHTTP_NO_REQUEST_DATA : (LPVOID)requestBody.c_str();
    DWORD bodyLen = (DWORD)requestBody.length();

    if (!WinHttpSendRequest(hRequest, wideHeaders.c_str(), (DWORD)-1L, bodyPtr, bodyLen, bodyLen, 0) ||
        !WinHttpReceiveResponse(hRequest, NULL)) {
        DWORD errCode = GetLastError();
        closeHandles(hRequest, hConnect);
        return SupabaseResponse(502, "", "HTTPS request to Supabase failed (error " + to_string(errCode) + ").");
    }

    DWORD statusCode = 0;
    DWORD statusSize = sizeof(statusCode);
    WinHttpQueryHeaders(
        hRequest,
        WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
        WINHTTP_HEADER_NAME_BY_INDEX,
        &statusCode,
        &statusSize,
        WINHTTP_NO_HEADER_INDEX
    );

    string responseBody = readResponseBody(hRequest);
    closeHandles(hRequest, hConnect);

    return SupabaseResponse((int)statusCode, responseBody);
}

#endif
