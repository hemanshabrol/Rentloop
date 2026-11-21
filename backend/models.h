#ifndef MODELS_H
#define MODELS_H

// ============================================================================
// FILE: models.h
// Purpose: Core C++17 Object-Oriented domain models for RentLoop:
//          JsonHelper, Student, Listing, and Booking.
// ============================================================================

#include <ctime>
#include <stdexcept>
#include <string>

using namespace std;

const int MAX_LISTING_IMAGES = 5;

// ============================================================================
// CLASS: JsonHelper
// Purpose: Lightweight string-based JSON parser and builder for REST payloads.
// ============================================================================
class JsonHelper {
public:
    static string escape(const string& input) {
        string result;
        for (char c : input) {
            if (c == '\"') result += "\\\"";
            else if (c == '\\') result += "\\\\";
            else if (c == '\n') result += "\\n";
            else if (c == '\t') result += ' ';
            else if (c != '\r') result += c;
        }
        return result;
    }

    static string getString(const string& json, const string& key, const string& defaultVal = "") {
        string pattern = "\"" + key + "\"";
        size_t keyPos = json.find(pattern);
        if (keyPos == string::npos) return defaultVal;

        size_t colonPos = json.find(':', keyPos + pattern.length());
        if (colonPos == string::npos) return defaultVal;

        size_t valStart = json.find_first_not_of(" \t\r\n", colonPos + 1);
        if (valStart == string::npos || json.compare(valStart, 4, "null") == 0) {
            return defaultVal;
        }

        if (json[valStart] == '\"') {
            string output;
            for (size_t i = valStart + 1; i < json.length(); i++) {
                if (json[i] == '\\' && i + 1 < json.length()) {
                    char nextChar = json[++i];
                    output += (nextChar == 'n') ? '\n' : nextChar;
                } else if (json[i] == '\"') {
                    return output;
                } else {
                    output += json[i];
                }
            }
            return defaultVal;
        }

        size_t valEnd = json.find_first_of(",}\r\n ", valStart);
        return json.substr(valStart, (valEnd == string::npos ? json.length() : valEnd) - valStart);
    }

    static int getInt(const string& json, const string& key, int defaultVal = 0) {
        return (int)getLongLong(json, key, defaultVal);
    }

    static long long getLongLong(const string& json, const string& key, long long defaultVal = 0) {
        string raw = getString(json, key);
        if (raw.empty()) return defaultVal;
        try { return stoll(raw); } catch (...) { return defaultVal; }
    }

    static int getStringArray(const string& json, const string& key, string outArray[], int maxItems) {
        size_t keyPos = json.find("\"" + key + "\"");
        if (keyPos == string::npos) return 0;

        size_t openBracket = json.find('[', keyPos);
        size_t closeBracket = (openBracket == string::npos) ? string::npos : json.find(']', openBracket);
        if (closeBracket == string::npos) return 0;

        int count = 0;
        for (size_t pos = openBracket + 1; pos < closeBracket && count < maxItems; ) {
            size_t quoteStart = json.find('\"', pos);
            if (quoteStart == string::npos || quoteStart >= closeBracket) break;

            string item;
            size_t i = quoteStart + 1;
            for (; i < closeBracket && json[i] != '\"'; i++) {
                if (json[i] == '\\' && i + 1 < closeBracket) i++;
                item += json[i];
            }
            if (!item.empty()) outArray[count++] = item;
            pos = i + 1;
        }
        return count;
    }

    static string extractFirstObject(const string& arrayJson) {
        size_t firstBrace = arrayJson.find('{');
        if (firstBrace == string::npos) return "";

        int depth = 0;
        bool inQuotes = false;
        for (size_t i = firstBrace; i < arrayJson.length(); i++) {
            char c = arrayJson[i];
            if (c == '\\' && i + 1 < arrayJson.length()) { i++; continue; }
            if (c == '\"') inQuotes = !inQuotes;
            else if (!inQuotes) {
                if (c == '{') depth++;
                else if (c == '}' && --depth == 0) {
                    return arrayJson.substr(firstBrace, i - firstBrace + 1);
                }
            }
        }
        return "";
    }

    static string getTodayDate() {
        time_t now = time(nullptr);
        char buf[16];
        strftime(buf, sizeof(buf), "%Y-%m-%d", localtime(&now));
        return string(buf);
    }
};

// ============================================================================
// CLASS: Student
// Purpose: Represents an authenticated student account from public.profiles.
// ============================================================================
class Student {
private:
    string id;
    string fullName;
    string email;
    string phone;
    string institution;

public:
    Student() = default;

    Student(string studentId, string name, string mail, string phoneNum, string college)
        : id(studentId), fullName(name), email(mail), phone(phoneNum), institution(college) {}

    string getId() const { return id; }
    string getFullName() const { return fullName; }
    string getEmail() const { return email; }
    string getPhone() const { return phone; }
    string getInstitution() const { return institution; }
};

// ============================================================================
// CLASS: Listing
// Purpose: Encapsulates a rental item from public.listings, enforces category,
//          condition, and positive price validation, and manages availability.
// ============================================================================
class Listing {
private:
    long long id = 0;
    string ownerId;
    string itemName;
    string category;
    string brandModel;
    string description;
    string condition;
    int dailyPrice = 0;
    string pickupLocation;
    string availabilityStatus = "available";
    string imageUrls[MAX_LISTING_IMAGES];
    int imageCount = 0;

    bool isValidCategory(const string& cat) const {
        return cat == "Photography & Video" || cat == "Electronics & Audio" ||
               cat == "Sports & Mobility" || cat == "Academic & STEM Tools" ||
               cat == "Event Equipment" || cat == "Other Campus Gear";
    }

    bool isValidCondition(const string& cond) const {
        return cond == "Like New" || cond == "Excellent" || cond == "Good" || cond == "Fair";
    }

public:
    Listing() = default;

    Listing(long long listingId, string ownerUuid, string name, string cat, string brand,
            string desc, string cond, int price, string pickup, string status = "available")
        : id(listingId), ownerId(ownerUuid), itemName(name), category(cat), brandModel(brand),
          description(desc), condition(cond), dailyPrice(price), pickupLocation(pickup),
          availabilityStatus(status.empty() ? "available" : status) {}

    long long getId() const { return id; }
    string getOwnerId() const { return ownerId; }
    string getItemName() const { return itemName; }
    string getCategory() const { return category; }
    string getBrandModel() const { return brandModel; }
    string getDescription() const { return description; }
    string getCondition() const { return condition; }
    int getDailyPrice() const { return dailyPrice; }
    string getPickupLocation() const { return pickupLocation; }
    string getAvailabilityStatus() const { return availabilityStatus; }
    int getImageCount() const { return imageCount; }

    string getImageUrl(int index) const {
        return (index >= 0 && index < imageCount) ? imageUrls[index] : "";
    }

    void setImages(const string urls[], int count) {
        imageCount = 0;
        for (int i = 0; i < count && i < MAX_LISTING_IMAGES; i++) {
            if (!urls[i].empty()) imageUrls[imageCount++] = urls[i];
        }
    }

    bool isAvailable() const { return availabilityStatus == "available"; }
    bool isOwnedBy(const string& studentId) const { return !ownerId.empty() && ownerId == studentId; }
    void pause() { availabilityStatus = "paused"; }
    void reactivate() { availabilityStatus = "available"; }

    void validate(bool requireImages = true) const {
        if (ownerId.empty()) throw invalid_argument("Listing owner ID is required.");
        if (itemName.empty()) throw invalid_argument("Please enter the item name.");
        if (!isValidCategory(category)) throw invalid_argument("Please select a valid campus category.");
        if (description.empty() || description.length() > 800) {
            throw invalid_argument("Description is required and must be 800 characters or fewer.");
        }
        if (!isValidCondition(condition)) {
            throw invalid_argument("Please select a valid item condition (Like New, Excellent, Good, or Fair).");
        }
        if (dailyPrice <= 0) throw invalid_argument("Daily rental price must be a positive integer greater than 0.");
        if (pickupLocation.empty()) throw invalid_argument("Please enter a campus pickup location.");
        if (availabilityStatus != "available" && availabilityStatus != "paused") {
            throw invalid_argument("Availability status must be 'available' or 'paused'.");
        }
        if (requireImages && imageCount <= 0) throw invalid_argument("Please provide at least 1 product photo.");
    }

    void updateDetails(const string& newName, const string& newCategory, const string& newBrandModel,
                       const string& newDescription, const string& newCondition, int newDailyPrice,
                       const string& newPickupLocation, const string& newStatus) {
        itemName = newName;
        category = newCategory;
        brandModel = newBrandModel;
        description = newDescription;
        condition = newCondition;
        dailyPrice = newDailyPrice;
        pickupLocation = newPickupLocation;
        if (newStatus == "paused") pause();
        else if (newStatus == "available") reactivate();
        else if (!newStatus.empty()) availabilityStatus = newStatus;
        validate(false);
    }

    static Listing fromJson(const string& obj, const string& fallbackOwnerId = "") {
        return Listing(
            JsonHelper::getLongLong(obj, "id"),
            JsonHelper::getString(obj, "owner_id", fallbackOwnerId),
            JsonHelper::getString(obj, "item_name"),
            JsonHelper::getString(obj, "category"),
            JsonHelper::getString(obj, "brand_model"),
            JsonHelper::getString(obj, "description"),
            JsonHelper::getString(obj, "condition"),
            JsonHelper::getInt(obj, "daily_price"),
            JsonHelper::getString(obj, "pickup_location"),
            JsonHelper::getString(obj, "availability_status", "available")
        );
    }

    string toJsonPayload(bool includeOwnerId = false) const {
        string brandJson = brandModel.empty() ? "null" : "\"" + JsonHelper::escape(brandModel) + "\"";
        string json = "{";
        if (includeOwnerId) json += "\"owner_id\":\"" + JsonHelper::escape(ownerId) + "\",";
        json += "\"item_name\":\"" + JsonHelper::escape(itemName) + "\","
                "\"category\":\"" + JsonHelper::escape(category) + "\","
                "\"brand_model\":" + brandJson + ","
                "\"description\":\"" + JsonHelper::escape(description) + "\","
                "\"condition\":\"" + JsonHelper::escape(condition) + "\","
                "\"daily_price\":" + to_string(dailyPrice) + ","
                "\"pickup_location\":\"" + JsonHelper::escape(pickupLocation) + "\","
                "\"availability_status\":\"" + JsonHelper::escape(availabilityStatus) + "\"}";
        return json;
    }

    string buildImagesJsonPayload(long long targetListingId) const {
        string payload = "[";
        for (int i = 0; i < imageCount; i++) {
            if (i > 0) payload += ",";
            payload += "{\"listing_id\":" + to_string(targetListingId) +
                       ",\"image_url\":\"" + JsonHelper::escape(imageUrls[i]) +
                       "\",\"display_order\":" + to_string(i) + "}";
        }
        return payload + "]";
    }
};

// ============================================================================
// CLASS: Booking
// Purpose: Encapsulates a rental booking from public.bookings, calculates
//          inclusive rental duration and total price, and manages transitions.
// ============================================================================
class Booking {
private:
    long long id = 0;
    long long listingId = 0;
    string renterId;
    string startDate;
    string endDate;
    int dailyPrice = 0;
    int totalPrice = 0;
    string bookingStatus = "pending";

    static bool parseDate(const string& dateStr, tm& outTm) {
        if (dateStr.length() != 10 || dateStr[4] != '-' || dateStr[7] != '-') return false;
        try {
            int year = stoi(dateStr.substr(0, 4));
            int month = stoi(dateStr.substr(5, 2));
            int day = stoi(dateStr.substr(8, 2));
            if (year < 2020 || month < 1 || month > 12 || day < 1 || day > 31) return false;
            outTm = {};
            outTm.tm_year = year - 1900;
            outTm.tm_mon = month - 1;
            outTm.tm_mday = day;
            outTm.tm_hour = 12;
            return true;
        } catch (...) {
            return false;
        }
    }

public:
    Booking() = default;

    Booking(long long bookingId, long long targetListingId, string renterUuid,
            string startDt, string endDt, int pricePerDay, string status = "pending")
        : id(bookingId), listingId(targetListingId), renterId(renterUuid),
          startDate(startDt), endDate(endDt), dailyPrice(pricePerDay),
          bookingStatus(status.empty() ? "pending" : status) {
        totalPrice = calculateTotalPrice();
    }

    long long getId() const { return id; }
    long long getListingId() const { return listingId; }
    string getRenterId() const { return renterId; }
    string getStartDate() const { return startDate; }
    string getEndDate() const { return endDate; }
    int getDailyPrice() const { return dailyPrice; }
    int getTotalPrice() const { return totalPrice; }
    string getBookingStatus() const { return bookingStatus; }

    static int calculateInclusiveDays(const string& startDt, const string& endDt) {
        tm startTm = {}, endTm = {};
        if (!parseDate(startDt, startTm) || !parseDate(endDt, endTm)) return 0;

        time_t startEpoch = mktime(&startTm);
        time_t endEpoch = mktime(&endTm);
        if (startEpoch == -1 || endEpoch == -1 || endEpoch < startEpoch) return 0;

        return (int)(difftime(endEpoch, startEpoch) / (60 * 60 * 24) + 0.5) + 1;
    }

    int getRentalDays() const { return calculateInclusiveDays(startDate, endDate); }

    int calculateTotalPrice() const {
        int days = getRentalDays();
        return (days > 0 && dailyPrice > 0) ? days * dailyPrice : 0;
    }

    void validateNewRequest(const string& todayDate) const {
        if (listingId <= 0) throw invalid_argument("Valid listing ID is required.");
        if (renterId.empty()) throw invalid_argument("Authenticated renter ID is required.");

        int days = getRentalDays();
        if (days <= 0) {
            throw invalid_argument("Please select a valid start date and return date (return date cannot be earlier than start date).");
        }
        if (startDate < todayDate) throw invalid_argument("Rental start date cannot be in the past.");
        if (dailyPrice <= 0 || totalPrice <= 0 || totalPrice != days * dailyPrice) {
            throw invalid_argument("Invalid rental price calculation.");
        }
        if (bookingStatus != "pending") {
            throw invalid_argument("New booking requests must start with 'pending' status.");
        }
    }

    void approve() {
        if (bookingStatus != "pending") throw logic_error("Only pending booking requests can be approved.");
        bookingStatus = "approved";
    }

    void reject() {
        if (bookingStatus != "pending") throw logic_error("Only pending booking requests can be declined.");
        bookingStatus = "declined";
    }

    void markReturned() {
        if (bookingStatus != "approved") throw logic_error("Only approved rentals can be marked as returned.");
        bookingStatus = "returned";
    }
};

#endif
