# SES Tracker UI

The backend project is at [SES-Tracker-Backend](https://github.com/shivamJoker/ses-tracker-backend).

### Frontend Tech Stack
- SolidJS
- SolidStart (meta framework)
- AWS Amplify
- TypeScript
- ChartJS

## Preview
- **Dashboard** - This is the dashboard for SESami (our SES Tracker friend).
![ses-tracker-ui-dashboard](https://github.com/user-attachments/assets/e67cd2cd-d164-4d82-af64-187dc6397c9c)

- **SES Email Activity** - Here you can filter all your SES events via date range, or status:
    - `OPENED`
    - `CLICKED`
    - `SENT`
    - `DELIVERED`
    - `BOUNCED`
    - `COMPLAINED`

![ses-email-activity](https://github.com/user-attachments/assets/962e8bb2-e036-4ddf-a759-1fad08c2f343)

- **Suppressed Users / Emails** - This list saves you from accidentally sending emails to users who don't want our emails.

![suppressed-users](https://github.com/user-attachments/assets/c39bbccc-b5a7-46ef-bde9-f5f70b322bf8)

## About the frontend app
This app is built using SolidJS.
You can learn more at the [official website](https://start.solidjs.com).

## Building
By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.
