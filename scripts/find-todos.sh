#!/bin/bash

grep --colour=always -rnwi './services/' -E -e 'TODO|FIXME' |
sed -e 's/\([^ ]*\).*\(\/\/\|#\).*\(TODO\|FIXME\)/\1\t\2 \3/' |
column -t -s $'\t'
