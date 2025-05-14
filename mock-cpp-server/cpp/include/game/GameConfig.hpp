
#pragma once

#include <string>
#include "utils/Json.hpp"

/**
 * Structure to hold game configuration
 */
struct GameConfig {
    std::string id;
    std::string title;
    std::string executable_path;
    std::string working_directory;
    std::string arguments;
    std::string description;
    std::string image_url;
    int min_duration_seconds;
    int max_duration_seconds;
    
    // Convert to JSON
    json to_json() const;
    
    // Create from JSON
    static GameConfig from_json(const json& j);
};
