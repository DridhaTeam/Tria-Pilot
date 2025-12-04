'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import RequestModal from '@/components/collaborations/RequestModal'

export const dynamic = 'force-dynamic'

export default function CollaborationRequestPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const influencerId = searchParams.get('influencerId')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (influencerId) {
      setIsOpen(true)
    } else {
      router.push('/brand/marketplace')
    }
  }, [influencerId, router])

  const handleClose = () => {
    setIsOpen(false)
    router.push('/brand/marketplace')
  }

  if (!influencerId) {
    return null
  }

  return (
    <RequestModal
      isOpen={isOpen}
      onClose={handleClose}
      influencerId={influencerId}
    />
  )
}

