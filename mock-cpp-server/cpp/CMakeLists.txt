
cmake_minimum_required(VERSION 3.10)
project(VRKioskCommandCenter VERSION 1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Find required packages
find_package(Boost REQUIRED COMPONENTS system thread)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# Include directories
include_directories(${Boost_INCLUDE_DIRS})
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Add source files
file(GLOB SOURCES 
    "src/*.cpp"
    "src/core/*.cpp"
    "src/game/*.cpp"
    "src/session/*.cpp"
    "src/system/*.cpp"
    "src/websocket/*.cpp"
)

# Create executable
add_executable(vr_command_center ${SOURCES})

# Link libraries
target_link_libraries(vr_command_center 
    ${Boost_LIBRARIES}
    OpenSSL::SSL
    OpenSSL::Crypto
    Threads::Threads
)

# Installation
install(TARGETS vr_command_center DESTINATION bin)
install(FILES config/games.json DESTINATION etc/vr_command_center)
