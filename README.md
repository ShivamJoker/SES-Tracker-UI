# SES Tracker UI

The backend project is at [SES-Tracker-Backend](https://github.com/shivamJoker/ses-tracker-backend).

## Frontend Tech Stack
- SolidJS
- SolidStart (meta framework)
- AWS Amplify
- TypeScript
- ChartJS

## Preview
### 1. Dashboard
This is the dashboard for SESami (our SES Tracker friend).

![ses-tracker-ui-dashboard](https://github.com/user-attachments/assets/e67cd2cd-d164-4d82-af64-187dc6397c9c)

---

### 2. SES Email Activity
Here you can filter all your SES events via date range, or status:
- `OPENED`
- `CLICKED`
- `SENT`
- `DELIVERED`
- `BOUNCED`
- `COMPLAINED`

![ses-email-activity](https://github.com/user-attachments/assets/962e8bb2-e036-4ddf-a759-1fad08c2f343)

---

### 3. Suppressed Users / Emails
This list saves you from accidentally sending emails to users who don't want our emails.

![suppressed-users](https://github.com/user-attachments/assets/c39bbccc-b5a7-46ef-bde9-f5f70b322bf8)

---

### 4. Send a new email with SES
Just put in your `FROM` and `TO` email addresses, along with a subject and body, and hit Send.

![send-email-ses](https://github.com/user-attachments/assets/15d70f3e-699c-465a-930a-d77823c10699)

---

### 5. AWS Account Settings
You need to put three details:
    - AWS Account ID
    - IAM Role ARN
    - STS External ID

![aws-account-settings](https://github.com/user-attachments/assets/20b46bc4-dddf-4142-9886-660d1cccd5ed)

## About the frontend app
This app is built using SolidJS.
You can learn more at the [official website](https://start.solidjs.com).

### Building
By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.
