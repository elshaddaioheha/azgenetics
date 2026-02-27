import { ErrorBoundary } from '@/components/ErrorBoundary';
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | AZ genes',
  description: 'Secure genomic data management on Hedera',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
