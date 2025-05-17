import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  uptime: number;
  timestamp: string;
};

/**
 * Health check endpoint for container monitoring
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
} 