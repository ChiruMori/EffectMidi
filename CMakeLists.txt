# EffectMidi
# ChiruMori
# Since Nov 2024

cmake_minimum_required(VERSION 3.21)

# enables MSVC_RUNTIME_LIBRARY target property
cmake_policy(SET CMP0091 NEW)

set(VERSION "0.0.1")
project(EffectMidi VERSION "${VERSION}"
                   DESCRIPTION "Cross-Platform Led Controller By MIDI")
set(PORTMIDI_VERSION "v2.0.4")

include(FetchContent)

# portmidi
FetchContent_Declare(
    portmidi
    URL https://github.com/PortMidi/portmidi/archive/refs/tags/${PORTMIDI_VERSION}.tar.gz)
FetchContent_MakeAvailable(portmidi)
# add porttime directory (For header file)
set(PORTMIDI_SRC_DIR ${CMAKE_CURRENT_BINARY_DIR}/_deps/portmidi-src)
include_directories(${PORTMIDI_SRC_DIR}/porttime)
add_executable(${PROJECT_NAME} src/EffectMidi.cpp)
target_link_libraries(${PROJECT_NAME} portmidi)