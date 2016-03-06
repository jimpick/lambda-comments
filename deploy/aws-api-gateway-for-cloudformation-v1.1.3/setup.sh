#! /bin/bash

set -e

./unix/install.sh
./unix/deploy.sh | tee deploy.log
cat deploy.log | sed -n 's/^ServiceToken for CloudFormation: //p' > \
  ../../deploy/state/SERVICE_TOKEN

