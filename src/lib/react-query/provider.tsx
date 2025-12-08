'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: data is considered fresh for 30 seconds
            staleTime: 30 * 1000,
            // Cache time: data stays in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Refetch on window focus only for critical data
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Don't refetch on mount if data is fresh (reduces API calls)
            refetchOnMount: false,
            // Network mode: prefer cache first
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations once
            retry: 1,
            // Network mode
            networkMode: 'online',
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

