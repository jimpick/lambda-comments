#!/bin/sh

lambdaOutputKey="LambdaFunction"
templateName="ApiGatewayCloudFormation-1.0.0.template"

version="latest"
stackName="ApiGatewayCloudFormation"
while getopts ":n:v:" opt; do
  case ${opt} in
    n)
        stackName="${OPTARG}"
    ;;
    v)
        version="${OPTARG}"
    ;;
    \?)
        echo "Invalid argument: -$OPTARG" >&2
        exit 1;
    ;;
  esac
done

lambdaArn="";
while IFS=' ' read -ra outputs; do
    for output in "${outputs[@]}"; do
        key=$(echo "${output}" |cut -f1);
        if [ "${key}" == "${lambdaOutputKey}" ]; then
            lambdaArn=$(echo "${output}" |cut -f2);
        fi;
    done;
done <<< "$(aws cloudformation describe-stacks --stack-name ${stackName} --output text --query Stacks[*].Outputs)";

if [[ ${lambdaArn} != arn* ]] ; then
    echo "You have to run make install before deploying";
    exit 1;
fi

rm -f latest
wget http://apigatewaycloudformation.s3-website-eu-west-1.amazonaws.com/builds/${version}
aws lambda update-function-code --function-name "${lambdaArn}" --zip-file fileb://${version} --publish
rm -f latest

echo "Lambda updated"
echo "ServiceToken for CloudFormation: ${lambdaArn}"
