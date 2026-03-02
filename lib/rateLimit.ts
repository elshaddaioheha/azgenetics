import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// by default. These can be overridden when calling .limit()

let rateLimiters: any = null;

const getRateLimiters = () => {
    // Return cached limiters if they exist and we are in production
    // In dev, we can re-evaluate to pick up .env.local changes
    if (rateLimiters && process.env.NODE_ENV === 'production') return rateLimiters;

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null; // Return null if not configured
    }

    const redisClient = Redis.fromEnv();

    rateLimiters = {
        auth: new Ratelimit({
            redis: redisClient,
            limiter: Ratelimit.slidingWindow(5, "60 s"),
            analytics: true,
            prefix: "@upstash/ratelimit/auth",
        }),
        transactions: new Ratelimit({
            redis: redisClient,
            limiter: Ratelimit.slidingWindow(10, "10 s"),
            analytics: true,
            prefix: "@upstash/ratelimit/tx",
        }),
        api: new Ratelimit({
            redis: redisClient,
            limiter: Ratelimit.slidingWindow(60, "60 s"),
            analytics: true,
            prefix: "@upstash/ratelimit/api",
        }),
    };

    return rateLimiters;
};

// Helper to get IP from headers
export function getIP(request: Request | Headers): string {
    const headers = request instanceof Request ? request.headers : request;
    const xForwardedFor = headers.get("x-forwarded-for");
    if (xForwardedFor) {
        return xForwardedFor.split(",")[0].trim();
    }
    return "127.0.0.1";
}

/**
 * Standard Middleware Wrapper for Rate Limiting
 */
export type RateLimitType = 'auth' | 'transactions' | 'api';

export async function withRateLimit(
    request: Request,
    type: RateLimitType = 'api'
): Promise<Response | null> {
    const limiters = getRateLimiters();

    if (!limiters) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Upstash Redis env variables missing. Rate limiting bypassed.');
        }
        return null; // Bypass rate limiter
    }

    const ip = getIP(request);
    const { success, limit, remaining, reset } = await limiters[type].limit(ip);

    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests. Please slow down.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': reset.toString(),
                }
            }
        );
    }
    return null;
}
