// components/providers/ToastClientProvider.tsx
'use client'

import ToastProvider from '@/components/ui/Toast'

export default function ToastClientProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ToastProvider position="top-right" maxToasts={3}>
      {children}
    </ToastProvider>
  )
}