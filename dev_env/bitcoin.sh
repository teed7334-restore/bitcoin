#!/bin/bash
docker rm -f bitcoin;
docker run \
--name bitcoin \
-p 3000:3000 \
-v `pwd`/../:/app \
-it node:latest bash;
