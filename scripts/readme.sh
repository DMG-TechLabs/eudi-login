#!/usr/bin/env bash

header=$(cat << EOF
---
icon: home
label: Home
---
EOF
)

FILE="docs/Welcome.md"

echo "$header" > $FILE

cat ./README.md >> $FILE

