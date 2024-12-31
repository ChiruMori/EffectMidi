@echo off
cd build/_deps/portmidi-src/pm_win
patch -p1 pmwinmm.c ../../../../patches/pmwinmm.patch
cd ../../../../