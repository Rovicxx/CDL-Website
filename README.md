<<<<<<< HEAD
# Caritas Diocese of Libmanan Website - Local API for Admin Program Management

This project contains a static frontend and a small Express API to allow admin users to add new programs securely.

## Setup

1. Install server dependencies:

```bash
npm install express cors dotenv
```

2. Create a `.env` file in the project root and set the admin password (optional):

```
ADMIN_PASSWORD=CaritasFoundation2026
PORT=3000
```

3. Start the API server:

```bash
node server.js
```

4. Serve the static site (in a separate terminal). For example, using the included script:

```bash
npx http-server -p 8080 -c-1
```

Open `http://localhost:8080` in your browser and the API will be available at `http://localhost:3000/api/programs`.

## Notes
- The server stores programs in `programs.json` at the project root.
- This is a minimal dev setup. For production, secure HTTPS, proper authentication and rate-limiting are required.
- When deployed to Vercel, program additions are validated by the serverless API and stored locally in the browser via localStorage so they persist after refresh.

## Deploy to Vercel

This project can deploy directly to Vercel as a static site with a serverless function for admin program creation.

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Log in:

```bash
vercel login
```

3. Deploy the project:

```bash
vercel --prod
```

4. Add the admin password as a Vercel environment variable in the dashboard or via CLI:

```bash
vercel env add ADMIN_PASSWORD production
```

Use the same password you want to protect the Add Program form.

5. The function will be available at `/api/programs` and the frontend already targets this path when deployed on Vercel.

## Serverless (AWS SAM) Deployment

Prerequisites:
- Install and configure the AWS CLI with credentials.
- Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

1. Build the SAM app:

```bash
sam build
```

2. Deploy (guided - first time):

```bash
sam deploy --guided
```

During `--guided` you'll be prompted for a stack name and parameters — provide the admin password when prompted for `AdminPassword`.

3. After deploy, SAM will output the API endpoint. Update your static site's fetch URL if hosted separately (e.g., S3) to point to the new API.

4. Hosting the frontend on S3 + CloudFront (summary):
 - Create an S3 bucket for static hosting, enable static website hosting or use CloudFront for HTTPS.
 - Upload your static `index.html`, `about_us.html`, `images/`, and any assets.
 - If using CloudFront, configure the distribution to forward CORS headers and use the API endpoint from SAM as the origin for API requests.

If you want, I can generate a `samconfig.toml` or run `sam deploy --guided` steps for you and create a simple CloudFormation/S3 deployment script.
=======
# CDL-Website
>>>>>>> c73c92822c609f618ee7768a35cf2be2c7521a05
