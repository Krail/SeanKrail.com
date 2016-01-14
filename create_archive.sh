#!/bin/bash
#
# Parameters:  $1  -  Name of archive
#              $2  -  Message for commit
#
if [[ $# -ne 2 ]]; then
  echo "Have $# argument(s), expected 2."
  exit 1
fi
find . -name '*.DS_Store' -type f -delete
git add *
git commit -m "$1: $2"
git push origin master
CURDIR=$PWD
cd ./root/
  zip -qr ../releases/$1.zip .
cd $CURDIR
exit 0
