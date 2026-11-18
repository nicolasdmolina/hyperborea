#!/bin/sh
cd "$(dirname "$0")" && exec npm exec --yes --package=@archastro/clapper@0.4.0 --registry=https://registry.npmjs.org -- clapper "$@"
