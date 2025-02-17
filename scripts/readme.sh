#!/usr/bin/env bash

header=$(cat << EOF
---
icon: home
---
EOF
)

echo "$header" > docs/README.md

cat ./README.md >> docs/README.md

