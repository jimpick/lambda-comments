#!/bin/sh

stackName="ApiGatewayCloudFormation"

while getopts ":n:" opt; do
  case ${opt} in
    n)
        stackName="$OPTARG"
    ;;
    \?)
        echo "Invalid argument: -$OPTARG" >&2
        exit 1;
    ;;
  esac
done

aws cloudformation delete-stack --stack-name "${stackName}"
if [ $? -ne 0 ]; then
    echo "An error occurred while un-installing"
    exit 1
fi

stackId=$(aws cloudformation describe-stacks --stack-name "${stackName}" --output text |head -n1|cut -f6)
stackStatus="N/A"
printf "Un-installing..."
while [ "${stackStatus}" != "DELETE_COMPLETE" ]; do
    printf "."
    sleep 5
    stackStatus=$(aws cloudformation describe-stacks --stack-name "${stackId}" --output text |head -n1|cut -f7)

    if [ "${stackStatus}" == "DELETE_FAILED" ]; then
        echo "Un-installation failed. See the AWS CloudFormation Console for detailed information"
        exit 1
    fi
done;
echo "Un-installation complete"