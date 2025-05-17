# Docker Deployment Guide for SolSpore on Vercel

This guide explains how to deploy SolSpore using Docker Compose with Vercel.

## Prerequisites

- Docker and Docker Compose installed
- Vercel CLI installed
- Access to the SolSpore project on Vercel

## Local Development with Docker

1. Build the Docker containers:

   ```bash
   npm run docker:build
   ```

2. Start the containers:

   ```bash
   npm run docker:up
   ```

3. Access the application at http://localhost:3000

4. Stop the containers:
   ```bash
   npm run docker:down
   ```

## Deployment to Vercel with Docker

1. Make sure you have the Vercel CLI installed and are logged in:

   ```bash
   npm install -g vercel
   vercel login
   ```

2. To deploy, simply push your changes to your main branch. Vercel will automatically:

   - Use the Docker Compose setup specified in the vercel.json
   - Build the container
   - Deploy the containerized application

3. To deploy manually using the Vercel CLI:
   ```bash
   vercel --prod
   ```

## Environment Variables

Ensure all required environment variables are set in Vercel. You can use the Vercel UI or add them via the Vercel CLI:

```bash
vercel env add MY_ENV_VARIABLE
```

## Troubleshooting

1. If you encounter build issues:

   - Check the Docker build logs in Vercel
   - Ensure your Dockerfile and docker-compose.yml are valid
   - Verify that all required environment variables are set

2. For container health issues:
   - The `/api/health` endpoint can be used to check container health
   - Check container logs in Vercel

## Important Notes

- The application is configured for Docker in vercel.json with `"buildCommand": "docker-compose build"`
- Docker Compose is used instead of the traditional Next.js build process
- The Next.js application is configured with `output: 'standalone'` for optimal containerization
- Remember to keep your .env.local file updated with the necessary environment variables
