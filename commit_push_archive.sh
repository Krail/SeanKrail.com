#!/bin/bash
#
# Parameters:  $1  -  Message for commit
#              $2  -  Name of archive
#
if [[ $# -ne 2 ]]; then
  echo "Have $# argument(s), expected 2."
  exit 1
fi
find . -name '*.DS_Store' -type f -delete
echo "$2" > ./root/version.version
git add *
git commit -m "$2: $1"
git push origin master
CURDIR=$PWD
cd ./root/
  zip -qr ../releases/$2.zip .
cd $CURDIR
exit 0
