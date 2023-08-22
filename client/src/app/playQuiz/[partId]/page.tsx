import React from 'react';
import UserStream from '@/components/streaming/userStream';

export default function userStream({ params }: { params: { partId: string } }) {
  console.log('PARTICIPATION ID IN THE PAGE::', params.partId);
  return <UserStream partId={params.partId} />;
}
