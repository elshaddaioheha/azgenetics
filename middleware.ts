import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleIntl = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Initial response from next-intl (handles locale redirection)
    let response = handleIntl(request);

    // 2. Initialize Supabase with cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // 3. Authenticate User
    const { data: { user } } = await supabase.auth.getUser();

    // DASHBOARD BOUNDARY PROTECTION
    // Regex to match paths starting with/without locale then /dashboard
    const dashboardPattern = /^\/(?:[a-z]{2}\/)?dashboard(?:\/|$)/;

    if (dashboardPattern.test(pathname)) {
        // Determine the active locale for redirects
        const pathSegments = pathname.split('/').filter(Boolean);
        const firstSegment = pathSegments[0];
        const locale = routing.locales.includes(firstSegment as any) ? firstSegment : 'en';

        // A. Auth Guard
        if (!user) {
            // Redirect to sign-in if accessing any /dashboard route while unauthenticated
            const url = request.nextUrl.clone();
            url.pathname = `/${locale}/sign-in`;
            return NextResponse.redirect(url);
        }

        // B. Role Boundary Guard
        let userRole = user.user_metadata?.user_role;

        // Fallback: Check DB if metadata is missing (ensure consistency)
        if (!userRole) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('user_role')
                .eq('auth_id', user.id)
                .single();
            userRole = profile?.user_role || 'patient';
        }

        // Role to folder mapping
        const folderMapping: Record<string, string> = {
            'doctor': 'doctor',
            'researcher': 'researcher',
            'patient': 'individual'
        };

        const allowedFolder = folderMapping[userRole] || 'individual';

        // Parse the current dashboard subfolder
        // If locale is present, it's at index 2 (/[locale]/dashboard/[sub]) else index 1 (/dashboard/[sub])
        const segments = pathname.split('/').filter(Boolean);
        const dashboardIndex = segments.indexOf('dashboard');
        const currentSubFolder = segments[dashboardIndex + 1]; // e.g., 'doctor', 'researcher', or undefined

        // C. Strict Enforcement
        // If at the root /dashboard OR trying to access a folder that isn't ours
        if (!currentSubFolder || currentSubFolder !== allowedFolder) {
            console.log(`[Middleware] Unauthorized Dashboard Access: User Role [${userRole}] cannot access [${currentSubFolder || 'root'}]. Redirecting to [${allowedFolder}].`);

            const url = request.nextUrl.clone();
            url.pathname = `/${locale}/dashboard/${allowedFolder}`;

            // Preserve any search parameters (like ?tab=...)
            url.search = request.nextUrl.search;

            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api routes
         * - static assets
         * - image optimization
         * - favicon, robots, sitemap
         */
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
    ],
};
