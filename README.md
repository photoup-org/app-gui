# IoT Monitor App - Frontend (app-gui)

This is the frontend dashboard for the IoT Monitor system, built with **Next.js 14+ (App Router)**. It connects to a local Edge Server (Python FastAPI) to visualize real-time sensor data, manage device configurations, and handle user authentication via Auth0.

## Project Overview

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Authentication**: Auth0 (@auth0/nextjs-auth0)
- **Data Fetching**: SWR (Stale-While-Revalidate)
- **Visualization**: Recharts

The application is designed to run on a local network, communicating with an Edge Server that acts as a bridge between MQTT sensors and this dashboard.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: Version 20 or higher.
- **Edge Server**: The Python FastAPI backend must be running locally to provide data.
- **Auth0 Account**: You need an Auth0 tenant configured for this application.

## Installation

1. Navigate to the project directory:
   ```bash
   cd app-gui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

## Configuration

> [!IMPORTANT]
> **Security Warning**: Never commit your `.env.local` file to version control. It contains sensitive API keys and secrets.

1. Create a file named `.env.local` in the root of the `app-gui` directory.
2. Copy the following template into `.env.local` and fill in your specific values:

```bash
# Auth0 Configuration
# Generate a random secret with: openssl rand -hex 32
AUTH0_SECRET='your_generated_long_random_string'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your_auth0_client_id'
AUTH0_CLIENT_SECRET='your_auth0_client_secret'

# Edge Server API Configuration
# The URL where the Python backend is running
NEXT_PUBLIC_API_URL='http://localhost:8000'
```

### Environment Variable details:
- `AUTH0_SECRET`: A long, secret string used to encrypt the session cookie.
- `AUTH0_BASE_URL`: The base URL of your application (usually `http://localhost:3000` for development).
- `AUTH0_ISSUER_BASE_URL`: The URL of your Auth0 tenant.
- `AUTH0_CLIENT_ID`: Your Auth0 Client ID.
- `AUTH0_CLIENT_SECRET`: Your Auth0 Client Secret.
- `NEXT_PUBLIC_API_URL`: The endpoint for the local Edge Server API.

## Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To build the application for production usage:

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- [Tailwind CSS](https://tailwindcss.com/)


## Reset Command
npx tsx --env-file=.env.local scripts/nuke-dev-env.ts

## Stripe Webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

## 🗺️ HaaS Edge Architecture Roadmap- Implement the ui on the marketing page
   
### General fixes
   - Implement the Demo page
   - Redesign the success page
   - Fix the Items fields in the orders object being null (stripeIntentId, customerEmail)
   - Fix planID being null on the Departments table
   - Fix userID being null on the Orders table

### Phase 1: Edge Infrastructure (The Local Foundation)
- [x] **Dockerize the Edge Server:** Set up `docker-compose.yml` with Eclipse Mosquitto (MQTT broker) and InfluxDB (Time-Series Database).
- [x] **Python Edge Worker:** Implement the Python daemon to listen to MQTT, decrypt AES-128 payloads, map data via hardware drivers, and write to InfluxDB.
- [x] **Local Hardware Simulation:** Create `simulate_esp32.py` to verify the end-to-end MQTT -> Decryption -> DB pipeline.
- [x] **Enable WebSockets:** Configure `mosquitto.conf` to expose port `9001` for direct browser connections.

### Phase 2: Database & Dashboard State (The Business Logic)
- [ ] **Prisma Schema Migration:** Add a `PENDING_CONNECTION` (or `PROVISIONING`) state to the `DeviceStatus` enum in PostgreSQL.
- [ ] **Device Registration Flow:** Update the device scanning Server Action to save new hardware as `PENDING_CONNECTION` rather than `OFFLINE`.
- [ ] **Waiting UI:** Build a clean "Awaiting First Signal" loading state in the dashboard for pending devices.

### Phase 3: The Edge-to-Cloud Bridge (Local Dev Mode)
- [ ] **Status Sync Module:** Update the Python Edge Worker to detect unrecognized or newly flashed ESP32s transmitting for the first time.
- [ ] **Webhook Trigger:** Make the Python Worker fire an HTTP POST request to the Next.js app when a new device comes online.
- [ ] **Next.js Webhook Handler:** Create an API route (`/api/webhooks/device-online`) to flip the device status from `PENDING_CONNECTION` to `ACTIVE` in the cloud database.

### Phase 4: Frontend Real-Time Visualization
- [ ] **MQTT Frontend Client:** Install `mqtt` and create a reusable `useMqtt` React hook.
- [ ] **Local Connection:** Point the hook to `ws://localhost:9001` to intercept the local edge data safely during development.
- [ ] **Live UI Updates:** Wire the MQTT payload data into the `DeviceChartDialog` and Recharts components to animate telemetry in real-time.
- Design the Dashboard
