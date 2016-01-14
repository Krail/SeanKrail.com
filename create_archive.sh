#!/bin/bash
if [[ $# -ne 2 ]]; then
  echo "Have $# argument(s), expected 2. It's the name of the archive."
  exit 1
fi
find . -name '*.DS_Store' -type f -delete
CURDIR=$PWD
cd ./root/
  zip -qr ../releases/$1.zip .
cd $CURDIR
git commit -m "$2"
git push origin master
exit 0
