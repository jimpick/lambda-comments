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
* S3 - storage for comments and private data, plus requests and data transfer
* CloudWatch logs
* Lambda functions - only pay for invocations

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
  // akismet: '<api key from akismet.com>', // optional
  // slackWebhook: 'https://hooks.slack.com/services/...', // optional
}
```

### Parameters

**blog**: The full base url of the blog/website

**cloudFormation**: The name of the CloudFormation stack

**region**: The AWS region

**stage**: The API Gateway stage to create

**akismet**: (Optional, but recommended) API key from [akismet.com](https://akismet.com/) for spam filtering

**slackWebhook**: (Optional) Slack webhook - configure this if you want a notification in a Slack channel each time a comment is posted

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

## Temporary fix - update Lambda functions to use Node.js 4.3

CloudFormation has issues setting the runtime to 'nodejs4.3', see:

https://forums.aws.amazon.com/thread.jspa?threadID=229072

Until CloudFormation is updated, here's an extra step to update
the Lambda functions to use Node.js 4.3 using a custom script.

```
npm run flip-lambdas-to-4.3
```

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

This will run `apex deploy` in the `build/apex` directory to upload the
compiled lambda functions.

Alternatively, if you want to execute the compile and deploy steps in one
command, you can run: `npm run deploy-backend`

## Build the frontend javascript

```
npm run build-frontend
```

This builds the code in the `packages/frontend` directory.

## Upload the frontend javascript script to S3

```
npm run upload-script
```

This will copy `lambda-comments.js` to the S3 bucket.

Alternatively, if you want to execute the compile and deploy steps in one
command, you can run: `npm run deploy-frontend`.

If you want to deploy the backend and frontend all in one step, you can
use: `npm run deploy`

## Run the test suite

```
npm run test
```

This will run both the local tests, and remote test which test the
deployed API and lambda functions.

The local tests can be run as `npm run test-local`, and the remote tests can
be run as `npm run test-remote`.

Currently the test suite expects some data to pre-exist in the S3 bucket. Until
the tests are properly mocked, they will fail unless the data is created.

## View logs

You can tail the CloudWatch logs:

```
npm run logs
```

This just executes `apex logs -f` in `build/apex`

# To Do List

* Convert config to dot-env
* README for web page integration
* README for client site dev
* Support batches of records in worker
* Blog post
* Simplified installation
* Check that permalink and blog match
* Override for path location
* Fetch source page to confirm script is installed on first post
* Test on various browsers, polyfills
* CORS override
* Rearrange code: put lambda scripts under packages directory
* Admin: auth
* Admin: moderation
* Admin: submit ham/spam to akismet
* Admin: Turn comments on/off
* Support for editing blog posts for a limited time
* Mocks for AWS/API calls
* Integration test
* Selenium tests
* Coverage
* Handle DynamoDB ProvisionedThroughputExceededException
* Investigate Swagger
* Generate API docs
* Webpack 2 tree-shaking support
* Optimize download size
* Plugins for server-side rendering on common static site generators
* Optimized bundle for ES6-capable platforms
* Library for bundling with existing client-side javascript builds
* Investigate deep integration with React.js static site generators
 * [Gatsby](https://github.com/gatsbyjs/gatsby)
 * [Phenomic](https://github.com/MoOx/phenomic)
* Instructions for static-ish hosting platforms
 * [GitHub Pages](https://pages.github.com/)
 * [Surge](http://surge.sh/)
 * [Netlify](https://www.netlify.com/)
 * [Aerobatic](https://www.aerobatic.com/)
 * [Firebase](https://www.firebase.com/)
 * [Zeit](https://zeit.co/)

# Interesting links

* http://apex.run/ (Go, Terraform - we use Apex, but just for convenience to upload the functions)
* https://github.com/serverless/serverless (CloudFormation)
* https://github.com/motdotla/node-lambda
* [Azure Cloud Functions vs. AWS Lambda](https://serifandsemaphore.io/azure-cloud-functions-vs-aws-lambda-caf8a90605dd#.qtdnojr54)
* https://github.com/smallwins/lambda
* https://github.com/vandium-io/vandium-node
* https://github.com/donnemartin/awesome-aws#lambda
* https://github.com/donnemartin/awesome-aws#api-gateway
