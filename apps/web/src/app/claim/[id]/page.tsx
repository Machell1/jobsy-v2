import type { Metadata } from 'next';
import { ClaimProfileClient } from './claim-profile-client';

export const metadata: Metadata = {
  title: 'Claim Your Profile - Jobsy',
  description: 'Verify your identity and claim your business profile on Jobsy.',
};

export default async function ClaimProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClaimProfileClient id={id} />;
}
