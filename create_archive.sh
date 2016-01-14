#!/bin/bash
if [[ $# -ne 2 ]]; then
  echo "Have $# argument(s), expected 2. It's the name of the archive."
  exit 1
fi
find . -name '*.DS_Store' -type f -delete
echo "$1: $2"
echo '"$1: $2"'
echo ""$1: $2""
git add *
git commit -m "$1: $2"
git push origin master
CURDIR=$PWD
cd ./root/
  zip -qr ../releases/$1.zip .
cd $CURDIR
exit 0
