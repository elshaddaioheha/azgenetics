import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
// by default. These can be overridden when calling .limit()
export const rateLimit = {
    // Authentication routes: More restrictive
    auth: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/auth",
    }),

    // Transaction routes: Prevent drainage of treasury
    transactions: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "10 s"), // Max 10 per 10s
        analytics: true,
        prefix: "@upstash/ratelimit/tx",
    }),

    // General API: Standard protection
    api: new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(60, "60 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/api",
    }),
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
export async function withRateLimit(
    request: Request,
    type: keyof typeof rateLimit = 'api'
): Promise<Response | null> {
    const ip = getIP(request);
    const { success, limit, remaining, reset } = await rateLimit[type].limit(ip);

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
