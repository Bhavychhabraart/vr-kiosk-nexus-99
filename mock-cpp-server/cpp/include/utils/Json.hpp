
#pragma once

#include <nlohmann/json.hpp>

// Use the nlohmann::json library
using json = nlohmann::json;

// Helper function to parse a JSON string
inline json parseJson(const std::string& str) {
    try {
        return json::parse(str);
    } catch (const std::exception& e) {
        throw std::runtime_error("Failed to parse JSON: " + std::string(e.what()));
    }
}
