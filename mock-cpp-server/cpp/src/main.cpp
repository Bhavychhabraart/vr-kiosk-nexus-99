
#include <iostream>
#include <string>
#include <boost/program_options.hpp>

#include "CommandCenter.hpp"
#include "utils/Logger.hpp"

namespace po = boost::program_options;

int main(int argc, char* argv[]) {
    // Parse command-line options
    po::options_description desc("VR Kiosk Command Center Options");
    desc.add_options()
        ("help,h", "Show help message")
        ("port,p", po::value<uint16_t>()->default_value(8081), "WebSocket server port")
        ("config,c", po::value<std::string>()->default_value("config/games.json"), "Path to game configuration file")
        ("log-file,l", po::value<std::string>()->default_value("logs/command_center.log"), "Path to log file")
        ("verbose,v", "Enable verbose logging");
    
    po::variables_map vm;
    try {
        po::store(po::parse_command_line(argc, argv, desc), vm);
        po::notify(vm);
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        std::cerr << desc << std::endl;
        return 1;
    }
    
    // Show help message
    if (vm.count("help")) {
        std::cout << desc << std::endl;
        return 0;
    }
    
    // Get options
    uint16_t port = vm["port"].as<uint16_t>();
    std::string config_path = vm["config"].as<std::string>();
    std::string log_file = vm["log-file"].as<std::string>();
    bool verbose = vm.count("verbose") > 0;
    
    // Create logger
    auto logger = std::make_shared<Logger>(
        log_file,
        true,
        verbose ? Logger::Level::DEBUG : Logger::Level::INFO
    );
    
    try {
        // Create and start command center
        logger->info("Starting VR Kiosk Command Center on port " + std::to_string(port));
        CommandCenter command_center(port, config_path);
        command_center.start();
        
        // Wait for CTRL+C
        std::cout << "Press CTRL+C to exit" << std::endl;
        std::cin.get();
        
        // Stop command center
        command_center.stop();
        logger->info("VR Kiosk Command Center stopped");
    } catch (const std::exception& e) {
        logger->critical("Fatal error: " + std::string(e.what()));
        return 1;
    }
    
    return 0;
}
