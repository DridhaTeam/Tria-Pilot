'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import RequestModal from './RequestModal'

interface RequestCollaborationButtonProps {
  productId?: string
  productName?: string
  brandName?: string
  influencerId?: string
}

export default function RequestCollaborationButton({
  productId,
  productName,
  brandName,
  influencerId,
}: RequestCollaborationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="default"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm hover:shadow-md transition-all"
        size="lg"
        onClick={() => setIsOpen(true)}
      >
        Request Collaboration
      </Button>
      <RequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={productId}
        productName={productName}
        brandName={brandName}
        influencerId={influencerId}
      />
    </>
  )
}

