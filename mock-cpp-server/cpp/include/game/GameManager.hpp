
#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <optional>

#include "game/GameProcess.hpp"
#include "game/GameConfig.hpp"
#include "utils/Logger.hpp"
#include "utils/Json.hpp"

/**
 * Class for managing games and their processes
 */
class GameManager {
public:
    /**
     * Constructor
     * @param config_path Path to the game configuration file
     * @param logger Logger instance
     */
    GameManager(const std::string& config_path, std::shared_ptr<Logger> logger);
    
    /**
     * Launch a game
     * @param game_id ID of the game to launch
     * @return true if game was launched successfully, false otherwise
     */
    bool launchGame(const std::string& game_id);
    
    /**
     * End the current game
     * @return true if game was ended successfully, false otherwise
     */
    bool endGame();
    
    /**
     * Get the status of the game manager
     * @return JSON object with status information
     */
    json getStatus() const;
    
    /**
     * Check if a game is running
     * @return true if a game is running, false otherwise
     */
    bool isGameRunning() const;
    
    /**
     * Get the ID of the currently running game
     * @return Game ID if a game is running, empty string otherwise
     */
    std::string getCurrentGameId() const;
    
    /**
     * Get the title of the currently running game
     * @return Game title if a game is running, empty string otherwise
     */
    std::string getCurrentGameTitle() const;
    
    /**
     * Get all available games
     * @return JSON object with game information
     */
    json getAvailableGames() const;
    
private:
    // Load game configurations from file
    void loadGameConfigs(const std::string& config_path);
    
    // Map of game IDs to game configurations
    std::unordered_map<std::string, GameConfig> game_configs_;
    
    // Current game process
    std::unique_ptr<GameProcess> current_game_;
    
    // ID of the current game
    std::string current_game_id_;
    
    // Logger
    std::shared_ptr<Logger> logger_;
};
