import React from 'react'
import UserStream from '@/components/streaming/userStream'

export default function userStream({ params }: { params: { participationId: string } }) {
  return (
    <UserStream />
  )
}
