#!/usr/bin/env bash

header=$(cat << EOF
---
icon: home
label: Home
---
EOF
)

echo "$header" > docs/README.md

cat ./README.md >> docs/README.md

