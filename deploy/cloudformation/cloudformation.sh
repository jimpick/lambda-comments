#! /bin/bash

set -e

if [ "$1" = "create" ]; then
  ACTION=create-stack
elif [ "$1" = "update" ]; then
  ACTION=update-stack
elif [ "$1" = "delete" ]; then
  ACTION=delete-stack
else
  echo "Usage: $0 [create|update]"
  exit 1
fi

TAG='lambda-comments'
DIR=`cd $(dirname $0); pwd`
BABEL_NODE=$DIR/../../node_modules/babel-cli/bin/babel-node.js
BIN_DIR=$DIR/../../bin
STACK_NAME=$($BABEL_NODE $BIN_DIR/dump-config.js CLOUDFORMATION)
ORIGIN=$($BABEL_NODE $BIN_DIR/dump-config.js ORIGIN)
REGION=$($BABEL_NODE $BIN_DIR/dump-config.js REGION)

if [ "$ACTION" = "delete-stack" ]; then
  aws cloudformation delete-stack \
      --region $REGION \
      --stack-name $STACK_NAME
  exit 0
fi

aws cloudformation $ACTION \
    --region $REGION \
    --stack-name $STACK_NAME \
    --template-body file://$DIR/lambda-comments.json \
    --capabilities CAPABILITY_IAM \
    --parameters \
      ParameterKey=TagName,ParameterValue=$TAG,UsePreviousValue=false \
      ParameterKey=Origin,ParameterValue=$ORIGIN,UsePreviousValue=false \
|| true

# $BABEL_NODE $BIN_DIR/save-cloudformation-config.js
