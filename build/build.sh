#!/bin/bash

GO2RTC_VERSION="$1"
GITHUB="github.com/AlexxIT/go2rtc"
BASE_URL="https://$GITHUB/releases/download/$GO2RTC_VERSION"
USER_AGENT="https://github.com/bropat/go2rtc-static build script"
LICENSE="https://raw.githubusercontent.com/AlexxIT/go2rtc/master/LICENSE"

declare -A filenames
filenames[linux_amd64]="go2rtc_linux_amd64"
filenames[linux_arm]="go2rtc_linux_arm"
filenames[linux_arm64]="go2rtc_linux_arm64"
filenames[linux_i386]="go2rtc_linux_i386"
filenames[linux_mipsel]="go2rtc_linux_mipsel"
filenames[mac_amd64]="go2rtc_mac_amd64.zip"
filenames[mac_arm64]="go2rtc_mac_arm64.zip"
filenames[win_amd64]="go2rtc_win64.zip"
filenames[win_i386]="go2rtc_win32.zip"
filenames[win_arm64]="go2rtc_win_arm64.zip"

set -e
mkdir -p ../bin

for filename in "${!filenames[@]}"; do
    echo $filename
    echo "  downloading from $GITHUB"
    curl -f -L -# --compressed -A "$USER_AGENT" -o ${filenames[$filename]} "$BASE_URL/${filenames[$filename]}" 
    echo '  extracting'

    if [[ ${filenames[$filename]} = *.zip ]]; then
        unzip -o -d ../bin -j ${filenames[$filename]}
        if [[ ${filenames[$filename]} = *win* ]]; then
            mv ../bin/go2rtc.exe ../bin/go2rtc_$filename.exe
        else
            mv ../bin/go2rtc ../bin/go2rtc_$filename
        fi
        rm -f ${filenames[$filename]}
    else
        mv ${filenames[$filename]} ../bin
    fi

    curl -sf -L -A "$USER_AGENT" -o ../bin/go2rtc_$filename.LICENSE "$LICENSE" 
    echo $filename;
done
