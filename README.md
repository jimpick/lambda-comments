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

# Demo Instance

# API

# Deployment Instructions

## Configuration

##

# Similar Work

I'm using Apex, but just for uploading the functions. I haven't investigated the other projects yet.

* http://apex.run/ (Go, Terraform)
* https://github.com/serverless/serverless (CloudFormation)
* https://github.com/andrew-templeton/cfn-api-gateway-restapi (CloudFormation)
