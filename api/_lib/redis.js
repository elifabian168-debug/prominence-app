// Shared Upstash Redis client for all API routes.
// Vercel auto-injects UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN when
// the Upstash Redis integration is connected to the project.
import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();
