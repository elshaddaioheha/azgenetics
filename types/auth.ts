// Authentication types for dual auth flow

export type UserRole = 'patient' | 'doctor' | 'researcher';
export type SubscriptionTier = 'F1' | 'F2' | 'F3';
export type AuthType = 'wallet' | 'email';

export interface WalletUser {
    authType: 'wallet';
    walletAddress: string;
    role: UserRole;
    subscriptionTier: SubscriptionTier;
    createdAt: string;
    lastLoginAt: string;
    isNewUser?: boolean;
}

export interface EmailUser {
    authType: 'email';
    uid: string;
    email: string;
    fullName: string;
    role: UserRole;
    subscriptionTier: SubscriptionTier;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string;
}

export type AppUser = WalletUser | EmailUser;

export interface OTPVerification {
    email: string;
    code: string;
    expiresAt: number;
    verified: boolean;
}

export interface LoginAttempt {
    email: string;
    attempts: number;
    lastAttempt: number;
    blockedUntil?: number;
}
