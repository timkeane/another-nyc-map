#! /bin/bash

report() {
  echo "Error on line $1"
  echo "try installing dpdm"
  echo "npm i -g dpdm"
}

trap 'report $LINENO' ERR

dpdm ./js/index.js
