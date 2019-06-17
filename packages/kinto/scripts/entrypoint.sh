#!/usr/bin/env sh

export KINTO_URL=http://$KINTO_BASE_URL:8889/v1

# Wait for kinto-server to be up
while ! nc -z $KINTO_BASE_URL 8889;
        do
          echo sleeping;
          sleep 1;
        done;
        echo Connected!;

# init kinto with admin account
node ./src/index.js
