# SES Email Tracker - SESami
SESami stands for SES-friend (_ami_ is a French word that means friend).\
With SES, you can programmatically send your emails, and also get a Virtual Deliverability Dashboard.

But you never get to know exactly:
- which emails bounced
- which ones got opened and clicked (and when)
- which link in email got clicked, and how many times
- which email recipients out of the bulk opened your email
- which recipient complained / reported your email as spam

<img alt="Who opened my email, but cat version" src="https://github.com/user-attachments/assets/3839f35d-717d-470f-b2d9-a433481cb166" height="400px">

SES helps you:
- send emails (did we mention, for dirt cheap?)
- list templates that you have created
- check your sending statistics (not detailed)

SES is great for sending emails in bulk via API calls, maintaining a great reputation while you're at it.

## The catch?

SES doesn't have any interface where you can:
- send an email
- keep a custom suppression list
- track individual email events (e.g. which link was clicked?)

<img alt="Link Tracking in emails" src="https://github.com/user-attachments/assets/68a03328-631d-4120-bd3d-5270ca8e054d" height="350px">

These are features we all were quite missing (and what every SES user secretly wanted), and so we decided to use AWS services to make it happen, all event-driven.

![ses-account-dashboard-metrics](https://github.com/user-attachments/assets/d58b7283-9040-45ad-b324-7d64a8c6f2af)

## Our motivation for building this

For everyone who uses SES, SESami would make filtering emails by date-time, and drilling down via statuses; a tad bit easier.\
We had two options:

<img alt="the road not taken app meme" src="https://github.com/user-attachments/assets/e1560ca9-34d3-472d-9d80-a3b24d863395" height="300px">

This is a multi-tenant app, which means you can have multiple users and AWS accounts.

Here's an example where our app filters out the `DELIVERED` events by date and time, all sorted in descending order:

![Filtering delivered events](https://github.com/user-attachments/assets/9333928f-e2bb-4123-8ea8-991a56367c45)

It only needs 3 things from the user:
- AWS account ID
- IAM Role ARN
- STS External ID (we'll supply this from our end)

![AWS Settings](https://github.com/user-attachments/assets/0cfa1955-1bc0-4038-b3dc-3dc97c75efc5)

## Tech Stack
### Frontend
- [SolidJS](https://www.solidjs.com/)
- [SolidStart](https://start.solidjs.com/) (meta framework)
- [AWS Amplify](https://aws.amazon.com/amplify/)
- [TypeScript](https://www.typescriptlang.org/)
- [ChartJS](https://www.chartjs.org/)
### Backend
- [Momento Cache](https://www.gomomento.com/platform/cache/)
- [Amazon EventBridge](https://aws.amazon.com/eventbridge/)
- [AWS IAM](https://aws.amazon.com/iam/)
- [Amazon SES](https://aws.amazon.com/ses/)
- [AWS STS](https://docs.aws.amazon.com/iam/#sts) (Security Token Service)
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [AWS LLRT](https://github.com/awslabs/llrt)
- [AWS CDK](https://aws.amazon.com/cdk/)
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/)
- [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/)
- [Amazon Cognito](https://aws.amazon.com/cognito/)

## Our initial implementation
Starting out, this is all we had in [Excalidraw](https://excalidraw.com/), when it came to designing UI &darr;

![Excalidraw initial design](https://github.com/user-attachments/assets/6641829e-facb-42f2-99a7-3c8fc94c2d2f)

We had to implement:
| Feature       | Situation     |
| ------------- | ------------- |
| a custom suppression list | <img alt="suppression-list-card-meme" src="https://github.com/user-attachments/assets/55c4078d-89c0-4e11-a297-ae91f57c1cf9" height="200px"> |
| event tracking | <img alt="who opened my email 7 times" src="https://github.com/user-attachments/assets/e32eeff1-3e1c-404f-8554-29ef36eabe1f" height="200px"> |

We needed to know exactly who, when and why our emails were opened.

- **Who?** thatguy@email.com
- **When?** 18/5/2025, 11:55:23 pm
- **Why?** Impossible to know, unless AI starts reading minds.

## Use of Momento Cache
We assume the role, and then we get the token of AWS credentials from STS for the source account (which we are using to send emails).
So we store the token on Momento, so that we don't generate it on every API request.

<img alt="Momento Cache" src="https://github.com/user-attachments/assets/043687a3-7536-48a4-8ce7-2cf102155474" height="300px">

STS tokens have an expiration time of 1 hour by default.
When the user uses our SendEmail API to send emails, we fetch the token from Momento cache, and use it to authenticate and send emails on behalf of them.

## Use of Amazon EventBridge
The source account uses AWS configuration set to enable SES events to be sent on the default event bus. Then the source account creates a new EventBridge rule to send that event to send that event to our AWS account or the destination account, and to our event bus.

<img alt="Amazon EventBridge" src="https://github.com/user-attachments/assets/3d4dca0d-7b7d-4e36-8013-3486438d409f" height="200px">

Our AWS account event bus has a resource policy which allows external AWS account to send events to us directly. Then we have a Lambda function which listens to the event on event bus, categorises, and stores the event in Amazon DynamoDB.

## Why are we using API Gateway?

<img alt="Amazon API Gateway" src="https://github.com/user-attachments/assets/6c700d37-dc15-4dcb-85eb-197970928e0d" height="200px">

We are using API Gateway to route requests to AWS Lambda. We have the following endpoints:

| Path                | Method | Description                                                 |
| ------------------- | ------ | ----------------------------------------------------------- |
| `/events`           | GET    | Gets all the events while filtering date and status         |
| `/suppression-list` | GET    | Gets all the email addresses in the custom suppression list |
| `/verify-sts`       | GET    | Verifies the assumed role                                   |
| `/mail`             | POST   | Sends emails                                                |
## Use of Amazon Cognito
To authenticate users, we use custom attributes to assign their custom ID, sts role and external ID.

<img alt="Amazon Cognito" src="https://github.com/user-attachments/assets/1a2fc3a9-9284-46e9-aaea-52d1d24a3c6f" height="200px">

When user tries to send email via us, we fetch the attributes from the user and then we generate the token based on account.\
Then we store it in the Momento Cache.
## Usage of AWS CDK (Cloud Development Kit)
CDK allows us to easily configure AWS Lambda and all the other services.

<img alt="AWS CDK" src="https://github.com/user-attachments/assets/0fc3a1d5-fb9f-42bf-97df-a97ad12b1117" height="200px">

All the AWS services have been configured via CDK, as it provides a configured way to manage all the AWS services.
## Why are we using AWS Amplify?
We are logging and signing up our users via Amazon Cognito.

<img alt="AWS Amplify" src="https://github.com/user-attachments/assets/597ca6eb-3965-4c37-afb1-5ba51c056eb5" height="200px">

AWS Amplify SDK helps us with the hosting and static web app deployment of our SolidJS app.

## Using AWS LLRT, and not NodeJS
Since LLRT is written in Rust and has ~ 10 MB of bundled size, it reduces the cold start of Lambda; hence reducing the response time of our API.
Our API now responds in < 200 ms.

## RBAC (Role Based Access Control)

In order to use SESami (SES Email Tracker), first you need to have your SES enabled in production mode (out of the sandbox), then create a permission policy and an IAM role to allow access by connecting your AWS SES.

- Role Based Access Control
- Source / customer account: Creates IAM role with Trust Policy to allow our AWS account to access SES (Least Privilege Principle)
![IAM permissions meme](https://github.com/user-attachments/assets/c4fe947d-baaa-48c3-b1d1-b751d5eb9ce3)

- To use SES API, the source account calls our SES API proxy
	- We get the token validated
	- The resource based policy in our AWS account allows the specified account to send events to our bus directly, as it is attached to our AWS Event bus
- EventBridge rule
	- Role ARN
	- External ID
- sts:AssumeRole (1 hour by default)

Here's a flow diagram to better explain what's happening under the hood:
```mermaid
graph TD
 A(SES Configuration Set) --> B(All SES events are selected there)
 B --> C(Default Event bus of customer)
 C --> D(Eventbridge new rule)
 D --> E(Sends the same events to our AWS customer / facilitator)
```

We send emails on behalf of them (the customer or source account) and do suppression checks, and we'll also be logging the email content in future.

We can't keep sending emails to users who keep reporting us as spam.\
Otherwise, this happens &darr;

![ses-sending-paused-gta-meme](https://github.com/user-attachments/assets/a1fbf5c8-3158-40d4-99ee-7ce69fb67a08)


### Creating an Amazon EventBridge rule
#### Define rule detail
- First we go to Amazon EventBridge &rarr; Rules &rarr; Create rule
- We give it a name, and select `default` from the **Event bus** dropdown
- We enable the toggle for the rule on selected event bus
- We select **Rule with an event pattern** in **Rule detail** and click Next

![1. Define rule detail in Amazon EventBridge](https://github.com/user-attachments/assets/e5bb8297-a7d8-4543-b4f7-b9ad3e8e39ee)

#### Build event pattern
- In **Creation method**, we select **Use pattern form**
- In **Event source**, we select **AWS Services**
- In **AWS Service**, we select **Simple Email Service (SES)**
- In **Event type**, we select **All Events**, and click Next
![2. Build event pattern](https://github.com/user-attachments/assets/b0b1fd16-7890-4f74-9acf-b4c56c1db52a)

#### Select target(s)
- We select **EventBridge event bus** as target
- In **Target types**, we select **Event bus in a different account or Region**
- We put the recently created ses-event-bus's ARN in **Event bus as target**
- In **Execution role**, we chose to **Create a new role for this specific resource**
- We leave the role name as-is, and click Next

![3. Select targets](https://github.com/user-attachments/assets/7da41096-74f0-4555-b53c-677a57bed2f9)

We update our external ID in IAM &arr; Role &rarr; SES-RBAC &rarr; Trust Relationships

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::205979422636:role/AWSMailSES"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": "TgkeVMykC5ePaij8oV0gV"
                }
            }
        }
    ]
}
```
####
![Trust relationships in IAM Roles](https://github.com/user-attachments/assets/999d4d0d-43a6-4ac0-943d-a9b70b1f7d57)

We add an identity:

![Add an email address identity](https://github.com/user-attachments/assets/809b985e-ffa2-4a0c-83a1-d44d37b2f3b7)

Now we are all set to allowing our AWS account to send emails on behalf of the customer's SES account!

## Future Scope

- Subscription Management
	- Verified Users List
	- Unsubscribed Users List
- Email Content Storage
	- Templates
- Bulk Emailing API
- Caching suppressed users on Momento Cache (instead of DynamoDB)
- Date and Time Presets for filtering events (1 year, 1 month, 1 week etc.)
- Filtering by email address of users
- Allow suppression list to be modified (adding, editing, deleting user email addresses)
- Sync suppression list with AWS (to ensure non-deliverability of emails for suppressed users)
