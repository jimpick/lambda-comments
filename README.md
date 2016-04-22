# Lambda Comments

This project which implements a minimal blog commenting service.

It is completely "serverless", designed to use the following Amazon services:

* [API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
* [Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
* [S3](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html)
* [DynamoDB streams](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
* [IAM](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
* [CloudWatch Logs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/WhatIsCloudWatch.html)

The Lambda functions are written in [ES6](http://exploringjs.com/es6/), with [async/await](http://pouchdb.com/2015/03/05/taming-the-async-beast-with-es7.html), transpiled using [Babel](https://babeljs.io/), and bundled using [Webpack](https://webpack.github.io/).

The AWS resources are provisioned using the [CloudFormation](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) service.

Additionally, we use Apex to simplify the uploading of the Lambda functions
(without the shim).

* http://apex.run/

# Costs

It should cost very little to run. The following resources are provisioned:

* DynamoDB - only provisioned for 1 read capacity unit, 1 write capacity unit (which limits it to 1 job per second)
* S3 - storage for retrieved files and JSON, plus data transfer
* CloudWatch logs
* Lambda invocations

# Deployment Instructions

## Prerequisites

* You will need an [AWS Account](https://aws.amazon.com/)
* You will need OS X, Linux, \*BSD or another Unix-based OS (scripts will need some modifications for Windows)
* Install the [AWS CLI](https://aws.amazon.com/cli/) and ensure credentials are setup under ~/.aws/credentials ([Instructions](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-config-files))
* Install [Node.js](https://nodejs.org/) (tested with v4.2.6 and v5.7.0)
* `git clone https://github.com/jimpick/lambda-comments.git` (https)  
or  
`git clone git@github.com:jimpick/lambda-comments.git` (git)
* `cd lambda-comments`
* `npm install`
* Install [Apex](http://apex.run/)

## Configuration

Copy `config.template.js` to `config.js` and customize it.

```
cp config.template.js config.js
```

The default config.template.js is:

```
export default {
  blog: 'http://example.com/',
  cloudFormation: 'lambdaComments',
  region: 'us-west-2',
  stage: 'prod',
  // akismet: '<api key from akismet.com>' // optional
}
```

### Parameters

**blog**: The full base url of the blog/website

**cloudFormation**: The name of the CloudFormation stack

**region**: The AWS region

**stage**: The API Gateway stage to create

**akismet**: (Optional, but recommended) API key from [akismet.com](https://akismet.com/) for spam filtering

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

## Save the references to the provisioned CloudFormation resources

```
npm run save-cloudformation
```

This will create a file in `deploy/state/cloudFormation.json`

## Generate an API key

```
npm run gen-api-key
```

This will create a file in `deploy/state/apiKey.json` containing an
apiKey variable that will be baked into the client to sign requests.

The purpose of the API key is to try to minimize spam to the API, but
as the API key is distributed publicly as part of the javascript, it's
only there to stop non-sophisticated spammers who don't care enough to
extract the API key and sign their requests.

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

## Upload the frontend javascript script to S3

```
npm run upload-script
```

This will copy `lambda-comments.js` to the S3 bucket.

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

# To Do List

* Script to flip lambda functions to node4.3
* Parameterize names of lambda functions and API Gateway
* "Marketing" link to project page
* Slack notifications
* Private directory on S3
* Convert config to dot-env
* Top-level package.json scripts for client side dev
* README for client site dev
* Check that permalink and blog match
* Override for path location
* Fetch source page to confirm script is installed on first post
* Test on various browsers, polyfills
* Support batches of records in worker
* Blog post
* Rearrange code: put lambda scripts under packages directory
* Admin auth
* Admin web interface / auth for hiding posts / moderation
* Turn comments on/off via admin
* Support for editing blog posts for a limited time
* Mocks for AWS calls
* Integration test
* Selenium tests
* Coverage
* Handle DynamoDB ProvisionedThroughputExceededException
* Investigate Swagger
* Generate API docs
* Webpack 2 tree-shaking support

# Similar Work

I'm using Apex, but just for uploading the functions. I haven't investigated the other projects yet.

* http://apex.run/ (Go, Terraform)
* https://github.com/serverless/serverless (CloudFormation)
* https://github.com/andrew-templeton/cfn-api-gateway-restapi (CloudFormation)
