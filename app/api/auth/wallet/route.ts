import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/_context';

export async function POST(request: NextRequest) {
    try {
        const { walletAddress, role, subscriptionTier } = await request.json();

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Check if wallet user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('wallet_address', walletAddress)
            .eq('auth_type', 'wallet')
            .single();

        // If user exists, update last login and return profile
        if (existingUser && !fetchError) {
            await supabase
                .from('profiles')
                .update({ last_login_at: new Date().toISOString() })
                .eq('wallet_address', walletAddress);

            return NextResponse.json({
                success: true,
                user: {
                    walletAddress: existingUser.wallet_address,
                    role: existingUser.user_role,
                    subscriptionTier: existingUser.subscription_tier,
                    isNewUser: false,
                },
            });
        }

        // If no role provided, this is initial connection - tell client to show onboarding
        if (!role) {
            return NextResponse.json({
                success: true,
                requiresOnboarding: true,
                walletAddress,
            });
        }

        // Validate role and subscription tier
        if (!['patient', 'doctor', 'researcher'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        const tier = subscriptionTier || 'F1';
        if (!['F1', 'F2', 'F3'].includes(tier)) {
            return NextResponse.json(
                { error: 'Invalid subscription tier' },
                { status: 400 }
            );
        }

        // Create new wallet user profile
        const { data: newUser, error: insertError } = await supabase
            .from('profiles')
            .insert({
                wallet_address: walletAddress,
                user_role: role,
                subscription_tier: tier,
                auth_type: 'wallet',
                name: `User ${walletAddress.slice(0, 8)}...`,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating wallet user:', insertError);
            return NextResponse.json(
                { error: 'Failed to create profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                walletAddress: newUser.wallet_address,
                role: newUser.user_role,
                subscriptionTier: newUser.subscription_tier,
                isNewUser: true,
            },
        });

    } catch (error) {
        console.error('Wallet auth error:', error);
        return NextResponse.json(
            { error: 'Failed to authenticate with wallet' },
            { status: 500 }
        );
    }
}
