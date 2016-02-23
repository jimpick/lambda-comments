#! /bin/bash

TAG='lambda-scraper-queue'
DIR=$(dirname $0)
SERVICE_TOKEN=$(cat $DIR/../SERVICE_TOKEN)

if [ "$1" = "create" ]; then
  ACTION=create-stack
elif [ "$1" = "update" ]; then
  ACTION=update-stack
else
  echo "Usage: $0 [create|update]"
  exit 1
fi

aws cloudformation $ACTION \
    --region us-west-2 \
    --stack-name lambdaScraperQueue2 \
    --template-body file://$DIR/lambda-scraper-queue.json \
    --capabilities CAPABILITY_IAM \
    --parameters \
      ParameterKey=TagName,ParameterValue=$TAG,UsePreviousValue=false \
      ParameterKey=ServiceToken,ParameterValue=$SERVICE_TOKEN,UsePreviousValue=false

