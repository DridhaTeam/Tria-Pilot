'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Clock, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useCollaborations, useUpdateCollaborationStatus } from '@/lib/react-query/collaborations'

interface Collaboration {
  id: string
  message: string
  status: string
  createdAt: string
  brand: {
    id: string
    name?: string
    brandProfile?: {
      companyName?: string
    }
  }
  proposalDetails?: {
    budget?: number
    timeline?: string
    goals?: string[]
    notes?: string
    productId?: string
  }
}

export default function InfluencerCollaborationsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; collabId: string | null; status: 'accepted' | 'declined' | null }>({
    open: false,
    collabId: null,
    status: null,
  })

  const { data: collaborationsData, isLoading: loading } = useCollaborations('received')
  const updateStatusMutation = useUpdateCollaborationStatus()

  const collaborations: Collaboration[] = collaborationsData || []

  const handleStatusChange = (collabId: string, status: 'accepted' | 'declined') => {
    setConfirmDialog({ open: true, collabId, status })
  }

  const confirmStatusChange = () => {
    if (!confirmDialog.collabId || !confirmDialog.status) return

    updateStatusMutation.mutate({
      id: confirmDialog.collabId,
      status: confirmDialog.status,
    })

    setConfirmDialog({ open: false, collabId: null, status: null })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500 text-white">Accepted</Badge>
      case 'declined':
        return <Badge className="bg-red-500 text-white">Declined</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredCollaborations = collaborations.filter((collab) => {
    if (filter === 'all') return true
    return collab.status === filter
  })

  return (
    <div className="min-h-screen bg-cream pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <MessageSquare className="h-7 w-7 text-zinc-900 dark:text-zinc-100" />
            </motion.div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Collaborations</h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-base ml-10">
            Manage collaboration requests from brands
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-6"
        >
          {[
            { id: 'all', label: 'All', count: collaborations.length },
            { id: 'pending', label: 'Pending', count: collaborations.filter((c) => c.status === 'pending').length },
            { id: 'accepted', label: 'Accepted', count: collaborations.filter((c) => c.status === 'accepted').length },
            { id: 'declined', label: 'Declined', count: collaborations.filter((c) => c.status === 'declined').length },
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg'
                  : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md'
              }`}
            >
              {tab.label} ({tab.count})
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-32 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : filteredCollaborations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MessageSquare className="w-16 h-16 text-zinc-400 dark:text-zinc-600 mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              No collaborations found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
              {filter === 'all'
                ? "You haven't received any collaboration requests yet. Brands will send you requests through the platform."
                : `No ${filter} collaborations found.`}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="space-y-4">
              {filteredCollaborations.map((collab, index) => (
                <motion.div
                  key={collab.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.01, y: -2 }}
                >
                  <Card className={`hover:shadow-xl transition-all duration-300 ${
                    updateStatusMutation.isPending && updateStatusMutation.variables?.id === collab.id ? 'opacity-60 pointer-events-none' : ''
                  }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {collab.brand.brandProfile?.companyName || collab.brand.name || 'Brand'}
                        </CardTitle>
                        {getStatusBadge(collab.status)}
                      </div>
                      <CardDescription className="text-xs">
                        Received: {new Date(collab.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {collab.message}
                  </p>

                  {collab.proposalDetails && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      {collab.proposalDetails.budget && (
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-1">
                            Budget
                          </p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            ₹{collab.proposalDetails.budget.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {collab.proposalDetails.timeline && (
                        <div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-1">
                            Timeline
                          </p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {collab.proposalDetails.timeline}
                          </p>
                        </div>
                      )}
                      {collab.proposalDetails.goals && collab.proposalDetails.goals.length > 0 && (
                        <div className="col-span-2">
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide mb-2">
                            Goals
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(collab.proposalDetails.goals as string[]).map((goal, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {collab.status === 'pending' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleStatusChange(collab.id, 'accepted')}
                          disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === collab.id}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm hover:shadow-md transition-all"
                        >
                          {updateStatusMutation.isPending && updateStatusMutation.variables?.id === collab.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="flex items-center gap-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              Processing...
                            </motion.div>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Accept
                            </>
                          )}
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleStatusChange(collab.id, 'declined')}
                          disabled={updateStatusMutation.isPending && updateStatusMutation.variables?.id === collab.id}
                          variant="outline"
                          className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400 transition-all"
                        >
                          {updateStatusMutation.isPending && updateStatusMutation.variables?.id === collab.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="flex items-center gap-2"
                            >
                              <Sparkles className="h-4 w-4" />
                              Processing...
                            </motion.div>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}

                  {collab.proposalDetails?.productId && (
                    <div className="pt-2">
                      <Link
                        href={`/marketplace/${collab.proposalDetails.productId}`}
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
                      >
                        View Product <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, collabId: null, status: null })}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {confirmDialog.status === 'accepted' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Confirm {confirmDialog.status === 'accepted' ? 'Acceptance' : 'Decline'}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to {confirmDialog.status === 'accepted' ? 'accept' : 'decline'} this collaboration request? 
                {confirmDialog.status === 'accepted' && ' This action will notify the brand and start the collaboration.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, collabId: null, status: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStatusChange}
                className={
                  confirmDialog.status === 'accepted'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {confirmDialog.status === 'accepted' ? 'Accept' : 'Decline'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

