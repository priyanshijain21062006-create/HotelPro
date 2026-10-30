# Deploy HotelPro

This repository includes a Render Blueprint for deploying the React website and Express API together as one service. MongoDB is hosted separately by MongoDB Atlas.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fpriyanshijain21062006-create%2FHotelPro)

## Before starting

- A Render account connected to GitHub.
- A MongoDB Atlas account and a database connection string.

Render's free web service is suitable for a demo, but it spins down after 15 minutes idle and can take about a minute to wake up. The Atlas Free cluster is intended for small development projects and is limited to 512 MB. These free plans are not intended for production use.

## 1. Create a MongoDB Atlas database

1. Create a MongoDB Atlas project and a Free cluster.
2. Create a database user with a strong, unique password. Keep the password private.
3. Add network access for the Render service to the Atlas network access list. Render shows the service's outbound IP ranges under **Connect → Outbound** after it is created. Prefer allowlisting those ranges. For a quick demo, some users allow `0.0.0.0/0`; that permits database connection attempts from any IP, so use a dedicated database user with a strong unique password and narrow its database permissions.
4. Copy the Atlas application's connection string and replace its password placeholder. Use the `hotelpro` database name, for example: `mongodb+srv://<db-user>:<password>@<cluster-host>/hotelpro?retryWrites=true&w=majority`.

Do not commit the connection string to GitHub or put it in a `VITE_` variable. It is entered only as the Render `MONGO_URI` secret.

## 2. Create the Render service

1. Click **Deploy to Render** above (or choose **New → Blueprint**) and connect the `priyanshijain21062006-create/HotelPro` repository on the `main` branch.
2. Review the Blueprint service named `hotelpro` and choose the Free plan for a demo deployment.
3. When prompted, enter `MONGO_URI`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters. The Blueprint generates `JWT_SECRET` automatically.
4. Create the Blueprint and wait for the deployment to become Live.

The start command creates the administrator account if it does not already exist and seeds sample hotel, room, guest, and booking data. The seed operation is idempotent. The client is served from the same Render URL as the API, so it uses `/api` and does not need a local development URL.

## 3. Open the website

Use the `https://...onrender.com` URL shown for the `hotelpro` service. The API health check is at `/api/health`. Sign in with the administrator email and password you entered in Render.

## Troubleshooting

- A failed deploy that mentions MongoDB usually means `MONGO_URI`, its database user password, or the Atlas network access list needs attention.
- If the service is live but returns an application error, inspect Render's service logs and check the environment variables. Never paste secret values into logs, issues, or source files.
- The first request after an idle period may take about a minute on Render's Free web plan.
