/**
 * FILE: packages/database/src/index.ts
 * PURPOSE: Database client initialization and export
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: Prisma, Redis
 * 
 * DESCRIPTION:
 * Singleton pattern for Prisma and Redis clients.
 * Ensures single connection pool across application.
 */

import { PrismaClient } from './generated/client';
import Redis from 'ioredis';

/**
 * Prisma client singleton
 */
let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

/**
 * Redis client singleton
 */
let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisInstance.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisInstance.on('connect', () => {
      console.log('Redis connected');
    });
  }
  return redisInstance;
}

/**
 * Graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
  if (redisInstance) {
    redisInstance.disconnect();
    redisInstance = null;
  }
}

// Export Prisma types
export * from './generated/client';
