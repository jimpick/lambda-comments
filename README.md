# Lambda Comments

This project which implements a minimal blog commenting service.

Blog posts:

* [Introducing lambda-comments](https://jimpick.com/2016/05/05/introducing-lambda-comments/) (you can try leaving a comment there)
* [A day on the Hacker News home page: lambda-comments](https://jimpick.com/2016/05/10/after-hacker-news-lambda-comments/)

Hacker News thread: https://news.ycombinator.com/item?id=11644042

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

* [DynamoDB](https://aws.amazon.com/dynamodb/pricing/) - only provisioned for 1 read capacity unit, 1 write capacity unit (which limits it to 1 job per second). This is the most expensive resource, approximately $0.65 a month.
* [S3](https://aws.amazon.com/s3/pricing/) - storage for comments and private data, plus requests and data transfer
* [CloudWatch Logs](https://aws.amazon.com/cloudwatch/pricing/)
* [Lambda functions](https://aws.amazon.com/lambda/pricing/) - only pay for invocations, first million requests per month are free (hopefully your blog isn't that popular)
* [API gateway](https://aws.amazon.com/api-gateway/pricing/) - only pay for API calls

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
* `npm run install-all` (runs `npm install` in top directory, and then sets up sub-packages under `packages`)
* Install [Apex](http://apex.run/)

## Configuration

Copy `.env.SAMPLE` to `.env` and customize it.

```
cp .env.SAMPLE .env
```

The default .env.SAMPLE contains:

```
# The URL of your blog/website that will be hosting the comments
# Used to generate CORS headers and also for Akismet
BLOG=https://example.com/blog/

# A name for your CloudFormation stack
# Also prefixed to the API Gateway REST API name
CLOUDFORMATION=myBlogComments

# The AWS region to provision the resources in
REGION=us-west-2

# The name for the API Gateway stage
STAGE=prod

# The Akismet.com API key (optional, but recommended)
# Akismet is a service for combatting blog spam from Automattic (WordPress)
#AKISMET=0123456789ab

# A Slack webhook to send notifications to (optional)
#SLACK=https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYY/ZZZZZZZZZZZZZZZZZZZZZZZZ

# Require author email address - string is error message to display.
#REQEMAIL='Email is required.'

# Require author name - string is error message to display.
#REQNAME='Name is required.'

We use [dotenv](https://github.com/motdotla/dotenv) so it is also possible to
configure the project by setting environment variables.

### Parameters

**BLOG**: The full base url of the blog/website

**CLOUDFORMATION**: The name of the CloudFormation stack

**REGION**: The AWS region

**STAGE**: The API Gateway stage to create

**AKISMET**: (Optional, but recommended) API key from [akismet.com](https://akismet.com/) for spam filtering

**SLACK**: (Optional) Slack webhook - configure this if you want a notification
in a Slack channel each time a comment is posted

## Installation

For now, follow the step-by-step instructions below. In the future, we will
develop a streamlined installation procedure.

## Use CloudFormation to create the AWS resources

```
npm run create-cloudformation
```

The command returns immediately, but it will take a while to complete
(typically 3-4 minutes). It's a good idea
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

## Embed the front-end JavaScript client

First, get the URL for the script:

```
npm run get-client-js-url
```

This will return a URL you will use below. eg.

```
//s3-us-west-2.amazonaws.com/myblogcomments-websites3-1ttpk69ph7gr7/lambda-comments.js
```

In the target web page (perhaps a blog generated by a static site generator
such as Jekyll or Hugo), add the following HTML to insert the comments from
the development server into the page:

```
<div id="lambda-comments"></div>
<script src="*** url from above ***"></script>
```

Providing that the webpage is located at the web address matching
the 'BLOG' setting in the .env configuration file, the comments form
should appear on the page. If not, check the developer tools console
in the web browser to see if there are any errors (typically due to
CORS).

## Front-end development

The code for the "front-end" javascript that displays the comments and the
comment form embedded in a web page lives in the `packages/frontend`
directory.

To run a development server, change into the `packages/frontend` directory,
copy .env.SAMPLE to .env, and run the development server.

```
cd packages/frontend
cp .env.SAMPLE .env
npm start
```

The development server is based on [react-project](https://github.com/ryanflorence/react-project)
with a heavily modified webpack configuration in `webpack.config.js`.

In the target web page (perhaps a blog generated by a static site generator
such as Jekyll or Hugo), add the following HTML to insert the comments from
the development server into the page:

```
<div id="lambda-comments"></div>
<script src="http://localhost:8081/lambda-comments.js"></script>
```

# To Do List

* Limit length of comments and metadata
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
* Detect DDoS style attacks and automatically throttle
  API Gateway to prevent unlimited charges
* Mocks for AWS/API calls
* Integration test
* Selenium tests
* Coverage
* Emoji support
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

Lots of related projects, many of which I haven't investigated yet.

## Lambda / Serverless Frameworks
* http://apex.run/ (Go, Terraform - we use Apex, but just for convenience to upload the functions)
* https://github.com/serverless/serverless (CloudFormation)
* https://github.com/motdotla/node-lambda
* [Azure Cloud Functions vs. AWS Lambda](https://serifandsemaphore.io/azure-cloud-functions-vs-aws-lambda-caf8a90605dd#.qtdnojr54)

## Lambda Libraries

* https://github.com/smallwins/lambda
* https://github.com/vandium-io/vandium-node

## Awesome Lists

* https://github.com/donnemartin/awesome-aws#lambda
* https://github.com/donnemartin/awesome-aws#api-gateway

## Serverless Comment Systems

* http://kevinold.com/2016/02/01/serverless-graphql.html
* https://github.com/serverless/serverless-graphql-blog
* https://github.com/ummels/jekyll-aws-comments

## Open-source Comment Systems

* https://posativ.org/isso/

## Hosted Comment Platforms

* https://disqus.com/
* http://web.livefyre.com/comments/
