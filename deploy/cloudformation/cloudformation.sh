#! /bin/bash

set -e

if [ "$1" = "create" ]; then
  ACTION=create-stack
elif [ "$1" = "update" ]; then
  ACTION=update-stack
else
  echo "Usage: $0 [create|update]"
  exit 1
fi

TAG='lambda-scraper-queue'
DIR=`cd $(dirname $0); pwd`
BABEL_NODE=$DIR/../../node_modules/babel-cli/bin/babel-node.js
BIN_DIR=$DIR/../../bin
SERVICE_TOKEN=$(cat $DIR/../../deploy/state/SERVICE_TOKEN)
STACK_NAME=$($BABEL_NODE $BIN_DIR/dump-config.js cloudFormation)

aws cloudformation $ACTION \
    --region us-west-2 \
    --stack-name $STACK_NAME \
    --template-body file://$DIR/lambda-scraper-queue.json \
    --capabilities CAPABILITY_IAM \
    --parameters \
      ParameterKey=TagName,ParameterValue=$TAG,UsePreviousValue=false \
      ParameterKey=ServiceToken,ParameterValue=$SERVICE_TOKEN,UsePreviousValue=false \
|| true

$BABEL_NODE $BIN_DIR/save-cloudformation-config.js

