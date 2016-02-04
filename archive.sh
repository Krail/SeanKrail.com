#!/bin/bash
#
# Parameters:  $1  -  Version of archive
#
if [[ $# -ne 1 ]]; then
  echo "Have $# argument(s), expected 1."
  exit 1
fi
find . -name '*.DS_Store' -type f -delete
echo "$1" > ./root/version.version
CURDIR=$PWD
cd ./root/
  zip -qr ../releases/$1.zip .
cd $CURDIR
exit 0
