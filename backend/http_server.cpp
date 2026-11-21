#ifndef HTTP_SERVER_CPP
#define HTTP_SERVER_CPP

// Include winsock2.h first before "using namespace std;" so Windows types
// do not conflict with C++17 standard library names (like std::byte).
#include <winsock2.h>
#include <iostream>
#include <string>

#include "health_controller.cpp"

using namespace std;

// Maximum number of controllers stored in our fixed-size array
const int MAX_CONTROLLERS = 20;

// ============================================================================
// CLASS: HttpServer
// Purpose: Simple HTTP server using Windows Sockets (Winsock2).
// Routes requests to registered ApiController pointers.
// ============================================================================
class HttpServer {
private:
    int port;
    SOCKET serverSocket;
    bool isRunning;

    // Fixed-size array of base class pointers (Demonstrates Pointers & Polymorphism)
    ApiController* controllers[MAX_CONTROLLERS];
    int controllerCount;

    // Returns status text for common HTTP status codes
    string getStatusMessage(int statusCode) const {
        if (statusCode == 200) return "OK";
        if (statusCode == 201) return "Created";
        if (statusCode == 204) return "No Content";
        if (statusCode == 400) return "Bad Request";
        if (statusCode == 401) return "Unauthorized";
        if (statusCode == 403) return "Forbidden";
        if (statusCode == 404) return "Not Found";
        if (statusCode == 409) return "Conflict";
        if (statusCode == 502) return "Bad Gateway";
        return "Internal Server Error";
    }

    // Extracts Content-Length header value if present
    size_t extractContentLength(const string& headers) const {
        string prefix = "Content-Length:";
        size_t pos = headers.find(prefix);
        if (pos == string::npos) {
            prefix = "content-length:";
            pos = headers.find(prefix);
        }
        if (pos == string::npos) return 0;

        size_t start = pos + prefix.length();
        size_t end = headers.find("\r\n", start);
        if (end == string::npos) end = headers.length();
        try {
            return (size_t)stoul(headers.substr(start, end - start));
        } catch (...) {
            return 0;
        }
    }

    // Extracts the Bearer token from the "Authorization: Bearer <token>" header if present
    string extractBearerToken(const string& rawRequest) const {
        string prefix = "Authorization: Bearer ";
        size_t pos = rawRequest.find(prefix);
        if (pos == string::npos) {
            prefix = "authorization: Bearer ";
            pos = rawRequest.find(prefix);
        }
        if (pos == string::npos) {
            return "";
        }

        size_t tokenStart = pos + prefix.length();
        size_t lineEnd = rawRequest.find("\r\n", tokenStart);
        if (lineEnd == string::npos) {
            lineEnd = rawRequest.length();
        }
        string token = rawRequest.substr(tokenStart, lineEnd - tokenStart);
        size_t firstChar = token.find_first_not_of(" \t\r\n");
        if (firstChar == string::npos) return "";
        size_t lastChar = token.find_last_not_of(" \t\r\n");
        return token.substr(firstChar, lastChar - firstChar + 1);
    }

    // Reads the HTTP request from a connected client and sends back the response
    void handleClientConnection(SOCKET clientSocket) {
        char buffer[8192];
        int bytesReceived = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);

        if (bytesReceived <= 0) {
            closesocket(clientSocket);
            return;
        }

        buffer[bytesReceived] = '\0';
        string rawRequest = buffer;

        // Extract HTTP method (e.g., "GET") and URL path (e.g., "/api/v1/health")
        // from the first line: "GET /api/v1/health HTTP/1.1"
        string method = "";
        string fullPath = "";

        size_t firstSpace = rawRequest.find(' ');
        if (firstSpace != string::npos) {
            method = rawRequest.substr(0, firstSpace);
            size_t secondSpace = rawRequest.find(' ', firstSpace + 1);
            if (secondSpace != string::npos) {
                fullPath = rawRequest.substr(firstSpace + 1, secondSpace - firstSpace - 1);
            }
        }

        // Remove query parameters after '?' if present
        string cleanPath = fullPath;
        size_t questionMark = cleanPath.find('?');
        if (questionMark != string::npos) {
            cleanPath = cleanPath.substr(0, questionMark);
        }

        // Extract optional request body (after empty line \r\n\r\n) and Bearer token
        string requestBody = "";
        size_t headerEnd = rawRequest.find("\r\n\r\n");
        if (headerEnd != string::npos) {
            string headersPart = rawRequest.substr(0, headerEnd);
            requestBody = rawRequest.substr(headerEnd + 4);
            size_t expectedLength = extractContentLength(headersPart);

            // Read remaining body bytes when payload spans multiple TCP packets
            while (requestBody.length() < expectedLength && expectedLength <= 2097152) {
                int extraBytes = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
                if (extraBytes <= 0) break;
                buffer[extraBytes] = '\0';
                requestBody.append(buffer, extraBytes);
            }
        }
        string bearerToken = extractBearerToken(rawRequest);

        HttpRequest request(method, cleanPath, requestBody, bearerToken);
        HttpResponse response;

        // Handle browser CORS preflight request
        if (method == "OPTIONS") {
            response.setJsonResponse("", 204);
        } else {
            bool routeFound = false;

            // Check each registered controller using base class pointer
            for (int i = 0; i < controllerCount; i++) {
                if (controllers[i] != nullptr && controllers[i]->canHandle(method, cleanPath)) {
                    controllers[i]->handleRequest(request, response);
                    routeFound = true;
                    break;
                }
            }

            // If no controller matched the path, return 404 JSON
            if (!routeFound) {
                string notFoundJson = "{\"error\": \"Endpoint not found\", \"path\": \"" + cleanPath + "\"}";
                response.setJsonResponse(notFoundJson, 404);
            }
        }

        // Build the complete HTTP response string using simple string concatenation
        string httpResponse = "HTTP/1.1 " + to_string(response.getStatusCode()) + " " +
                              getStatusMessage(response.getStatusCode()) + "\r\n" +
                              "Content-Type: " + response.getContentType() + "\r\n" +
                              "Access-Control-Allow-Origin: *\r\n" +
                              "Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS\r\n" +
                              "Access-Control-Allow-Headers: Content-Type, Authorization\r\n" +
                              "Content-Length: " + to_string(response.getBody().length()) + "\r\n" +
                              "Connection: close\r\n\r\n" +
                              response.getBody();

        send(clientSocket, httpResponse.c_str(), (int)httpResponse.length(), 0);
        closesocket(clientSocket);
    }

public:
    // Constructor sets the port and initializes the controller array
    HttpServer(int serverPort) {
        port = serverPort;
        serverSocket = INVALID_SOCKET;
        isRunning = false;
        controllerCount = 0;

        for (int i = 0; i < MAX_CONTROLLERS; i++) {
            controllers[i] = nullptr;
        }
    }

    // Destructor closes the server socket when the object is destroyed
    ~HttpServer() {
        stopServer();
    }

    // Adds a controller pointer to our array
    void registerController(ApiController* controllerPtr) {
        if (controllerCount < MAX_CONTROLLERS && controllerPtr != nullptr) {
            controllers[controllerCount] = controllerPtr;
            controllerCount++;
        }
    }

    // Starts Winsock, binds the port, and listens for requests
    bool startServer() {
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            cout << "[Error] Failed to initialize Winsock2." << endl;
            return false;
        }

        serverSocket = socket(AF_INET, SOCK_STREAM, 0);
        if (serverSocket == INVALID_SOCKET) {
            cout << "[Error] Could not create server socket." << endl;
            WSACleanup();
            return false;
        }

        // Allow restarting the server on the same port immediately
        int optVal = 1;
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&optVal, sizeof(optVal));

        sockaddr_in serverAddress;
        serverAddress.sin_family = AF_INET;
        serverAddress.sin_addr.s_addr = INADDR_ANY;
        serverAddress.sin_port = htons((u_short)port);

        if (bind(serverSocket, (sockaddr*)&serverAddress, sizeof(serverAddress)) == SOCKET_ERROR) {
            cout << "[Error] Failed to bind to port " << port << "." << endl;
            closesocket(serverSocket);
            WSACleanup();
            return false;
        }

        if (listen(serverSocket, SOMAXCONN) == SOCKET_ERROR) {
            cout << "[Error] Failed to listen on socket." << endl;
            closesocket(serverSocket);
            WSACleanup();
            return false;
        }

        isRunning = true;
        cout << "=====================================================" << endl;
        cout << " RentLoop / Rentora C++17 Backend Server Running" << endl;
        cout << " Listening on: http://localhost:" << port << endl;
        cout << " Health Check: http://localhost:" << port << "/api/v1/health" << endl;
        cout << " DB Check:     http://localhost:" << port << "/api/v1/db-health" << endl;
        cout << "=====================================================" << endl;

        while (isRunning) {
            sockaddr_in clientAddress;
            int clientLength = sizeof(clientAddress);
            SOCKET clientSocket = accept(serverSocket, (sockaddr*)&clientAddress, &clientLength);

            if (clientSocket == INVALID_SOCKET) {
                if (!isRunning) break;
                continue;
            }

            handleClientConnection(clientSocket);
        }

        return true;
    }

    // Stops the server and cleans up Winsock
    void stopServer() {
        isRunning = false;
        if (serverSocket != INVALID_SOCKET) {
            closesocket(serverSocket);
            serverSocket = INVALID_SOCKET;
            WSACleanup();
        }
    }
};

#endif
