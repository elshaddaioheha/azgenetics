export interface DataItem {
    id: string;
    name: string;
    type: 'genetic' | 'health' | 'professional';
    date: string;
    size: string;
    accessCount: number;
    nftCertified: boolean;
    isPrivate: boolean;
    encrypted: boolean;
}

export interface TokenTransaction {
    id: string;
    type: 'earned' | 'spent' | 'received';
    amount: number;
    description: string;
    date: string;
    fromTo: string;
}

export interface AccessRequest {
    id: string;
    requester: string;
    dataType: string;
    requestDate: string;
    status: 'pending' | 'approved' | 'rejected';
    purpose: string;
}

export interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    subscription_tier?: 'F1' | 'F2' | 'F3';
    user_role?: 'patient' | 'doctor' | 'researcher';
}
