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
