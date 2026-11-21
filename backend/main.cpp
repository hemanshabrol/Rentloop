// ============================================================================
// FILE: main.cpp
// Purpose: Entry point for the RentLoop / Rentora C++17 REST API Backend.
// Compile command (MinGW g++):
//   g++ -std=c++17 backend/main.cpp -lws2_32 -lwinhttp -o backend/server.exe
// ============================================================================

#include <iostream>
#include <string>

// Include http_server.cpp first so <winsock2.h> is loaded before <windows.h>
#include "http_server.cpp"
#include "supabase_client.h"
#include "supabase_client.cpp"
#include "models.h"
#include "rental_service.h"
#include "rental_service.cpp"
#include "health_controller.cpp"
#include "profile_controller.cpp"
#include "listings_controller.cpp"

using namespace std;

int main() {
    const int SERVER_PORT = 8080;

    // 1. Initialize Supabase REST client and OOP RentalService
    SupabaseClient* supabaseClient = new SupabaseClient();
    RentalService* rentalService = new RentalService(supabaseClient);

    // 2. Create API controllers using base class pointers (Polymorphism)
    ApiController* healthController = new HealthController(
        "rentora-cpp-backend",
        "C++17",
        "0.1.0"
    );
    ApiController* dbHealthController = new DatabaseHealthController(supabaseClient);
    ApiController* profileController = new ProfileController(supabaseClient);
    ApiController* listingsController = new ListingsController(rentalService);
    ApiController* bookingsController = new BookingsController(rentalService);

    // 3. Register controllers with the HTTP server
    HttpServer server(SERVER_PORT);
    server.registerController(healthController);
    server.registerController(dbHealthController);
    server.registerController(profileController);
    server.registerController(listingsController);
    server.registerController(bookingsController);

    // 4. Start the server (runs continuously until stopped with Ctrl+C)
    bool startedSuccessfully = server.startServer();

    // 5. Free dynamically allocated memory
    delete bookingsController;
    delete listingsController;
    delete profileController;
    delete dbHealthController;
    delete healthController;
    delete rentalService;
    delete supabaseClient;

    return startedSuccessfully ? 0 : 1;
}
