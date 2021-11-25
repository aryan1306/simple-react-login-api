#!/bin/bash
echo What should the version be?
read VERSION
docker build -t 9284807854/simple-login-api:$VERSION .
docker push 9284807854/simple-login-api:$VERSION
ssh root@165.232.185.113 "docker pull 9284807854/simple-login-api:$VERSION && docker tag 9284807854/simple-login-api:$VERSION dokku/simple-login-api:$VERSION && dokku deploy simple-login-api $VERSION"
