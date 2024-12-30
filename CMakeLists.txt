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

# set output directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})  # 设置库文件输出目录
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR})  # 设置静态库输出目录

include(FetchContent)

# portmidi
FetchContent_Declare(
    portmidi
    URL https://github.com/PortMidi/portmidi/archive/refs/tags/${PORTMIDI_VERSION}.tar.gz)
FetchContent_MakeAvailable(portmidi)

# add porttime directory (For header file)
set(PORTMIDI_SRC_DIR ${CMAKE_CURRENT_BINARY_DIR}/_deps/portmidi-src)
include_directories(${PORTMIDI_SRC_DIR}/porttime)

# 添加可执行文件
add_executable(${PROJECT_NAME} src/EffectMidi.cpp)

# 链接库
target_link_libraries(${PROJECT_NAME} portmidi)

# libportmidi.dll
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${CMAKE_CURRENT_BINARY_DIR}/_deps/portmidi-build/libportmidi.dll"
    "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}"
)