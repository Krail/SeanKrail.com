#!/bin/bash
#
# Parameters:  $1  -  Version of archive
#
if [[ $# -ne 1 ]]; then
  echo "Have $# argument(s), expected 1."
  exit 1
fi
find . -name '*.DS_Store' -type f -delete
echo "$1" > ./seankrail/version.version
CURDIR=$PWD
cd ./seankrail/
  zip -qr ../releases/$1.zip .
cd $CURDIR
exit 0
