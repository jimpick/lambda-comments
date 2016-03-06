# Lambda Scraper Queue

This is a demo project which implements a trivial REST service for queuing web scraping jobs.

It is completely "serverless", designed to use the following Amazon services:

* [API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
* [Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
* [S3](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
* [DynamoDB streams](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
* [IAM](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
* [CloudWatch Logs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/WhatIsCloudWatch.html)

The Lambda functions are written in [ES6](http://exploringjs.com/es6/), with [async/await](http://pouchdb.com/2015/03/05/taming-the-async-beast-with-es7.html), transpiled using [Babel](https://babeljs.io/), and bundled using [Webpack](https://webpack.github.io/).

The AWS resources are provisioned using the [CloudFormation](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) service, using an add-on custom resource handler to allocate API Gateway resources (which Amazon doesn't support yet for CloudFormation).

* http://www.jayway.com/2016/01/05/automate-aws-api-gateway-using-cloudformation/
* https://github.com/carlnordenfelt/aws-api-gateway-for-cloudformation

Additionally, we use Apex to simplify the uploading of the Lambda functions.

* http://apex.run/

# Costs

It should cost very little to run.

* DynamoDB - only provisioned for 1 read capacity unit, 1 write capacity unit (which limits it to 1 job per second)
* S3 - storage for retrieved files and JSON, plus data transfer
* CloudWatch logs
* Lambda invocations

# Demo Instance

API: https://3m7171w3c9.execute-api.us-west-2.amazonaws.com/prod
Web Interface: (not finished)

# API

## Submit a job

```
curl -X POST -d url=http://jimpick.com/ https://3m7171w3c9.execute-api.us-west-2.amazonaws.com/prod/jobs
```

# Deployment Instructions

## Prerequisites

* An [AWS Account](https://aws.amazon.com/)
* OS X, Linux, \*BSD or another Unix-based OS (scripts will need some modifications for Windows)
* Install the [AWS CLI](https://aws.amazon.com/cli/) and ensure credentials are setup under ~/.aws/credentials ([Instructions](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-config-files))
* Install [Node.js](https://nodejs.org/) (tested with v4.2.6)
* `git clone https://github.com/jimpick/lambda-scraper-queue.git` (https)  
or  
`git clone git@github.com:jimpick/lambda-scraper-queue.git` (git)
* `cd lambda-scraper-queue`
* `npm install`

## Setup IAM permissions

**Note:** These instructions are copied from: https://github.com/carlnordenfelt/aws-api-gateway-for-cloudformation#setup-iam-permissions


To be able to install the Custom Resource library you require a set of permissions.
Configure your IAM user with the following policy and make sure that you have configured your aws-cli with access and secret key.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:DescribeStacks",
        "iam:CreateRole",
        "iam:CreatePolicy",
        "iam:AttachRolePolicy",
        "iam:GetRole",
        "iam:PassRole",
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:GetFunctionConfiguration",

        "cloudformation:DeleteStack",
        "lambda:DeleteFunction",
        "iam:ListPolicyVersions",
        "iam:DetachRolePolicy",
        "iam:DeletePolicy",
        "iam:DeleteRole"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
```

## Install the Custom Resource Library

This installs a special AWS Lambda function so that the CloudFormation recipe can provision the API Gateway using custom resources from Carl Nordenfelt's [API Gateway for  CloudFormation](https://github.com/carlnordenfelt/aws-api-gateway-for-cloudformation) project.

```
npm run deploy-custom-resource
```

If successful, a 'service token' will be saved to `deploy/state/SERVICE_TOKEN`

## Configuration

Copy `config.template.js` to `config.js` and customize it.

```
cp config.template.js config.js
```

The default config.template.js is:

```
export default {
  cloudFormation: 'lambdaScraperQueue',
  region: 'us-west-2',
  stage: 'prod'
}
```

### Parameters

**cloudFormation**: The name of the CloudFormation stack

**region**: The AWS region

**stage**: The API Gateway stage to create

## Use CloudFormation to create the AWS resources

```
npm run create-cloudformation
```

The command returns immediately, but it will take a while to complete.
it's deploying a lot of resources. It's a good idea
to watch the CloudFormation task in the AWS Web Console to
ensure that it completes without errors.

**Note:** When working with the CloudFormation recipe, you can also use
`npm run update-cloudformation` and `npm run delete-cloudformation`

## Manually create the "prod" deployment stage in API gateway

When the CloudFormation stack in the previous step has been successfully
provisioned (check the AWS Web Console), do this step.

The Custom Resource library currently doesn't support this from CloudFormation, so, for now, we need to do it manually.

Go to "API Gateway" in the Amazon web console, and select the desired API. Click the `Deploy API` button, and under `Deployment Stage`, select `New Stage`. Enter `prod` for the `Stage Name`, and click the `Deploy` button.

## Save the references to the provisioned CloudFormation resources

```
npm run save-cloudformation
```

This will create a file in  `deploy/state/cloudFormation.json`

## Setup the Apex build directory

```
npm run setup-apex
```

This generates `build/apex/project.json`

## Compile the Lambda scripts using babel

```
npm run compile-lambda
```

This will use webpack and babel to compile the source code in `src/server/lambdaFunctions` into `build/apex/functions`

The webpack configuration is in `deploy/apex/webpack.config.es6.js`

## Deploy the lambda functions

```
npm run deploy-lambda
```

This will run `apex deploy` in the `build/apex` directory to upload the compiled lambda functions.

Alternatively, if you want to execute the compile and deploy steps in one command, you can run: `npm run deploy`

## Run the test suite

```
npm run test
```

This will run both the local tests, and remote test which test the deployed API and lambda functions.

The local tests can be run as `npm run test-local`, and the remote tests can be run as `npm run test-remote`.

## View logs

You can tail the CloudWatch logs:

```
npm run logs
```

This just executes `apex logs -f` in `build/apex`

## Submit a job

```
npm run post-url
```

Submits a job to the API that scrapes `http://jimpick.com/`

You should be able to see lambda output in the logs (after a few seconds delay). Also,
you should be able to see the files in S3 via the AWS Web Console.

# Similar Work

I'm using Apex, but just for uploading the functions. I haven't investigated the other projects yet.

* http://apex.run/ (Go, Terraform)
* https://github.com/serverless/serverless (CloudFormation)
* https://github.com/andrew-templeton/cfn-api-gateway-restapi (CloudFormation)
