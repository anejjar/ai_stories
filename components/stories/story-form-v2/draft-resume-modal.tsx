'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DraftResumeModalProps {
  open: boolean
  onResume: () => void
  onStartFresh: () => void
}

export function DraftResumeModal({ open, onResume, onStartFresh }: DraftResumeModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md rounded-3xl border-4 border-gray-100">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4"
          >
            <Clock className="w-8 h-8 text-purple-600" />
          </motion.div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Continue where you left off?
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            You have an unfinished story draft. Would you like to continue or start fresh?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={onResume}
            className="w-full py-6 text-lg font-semibold rounded-xl bg-purple-500 hover:bg-purple-600"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Continue Draft
          </Button>
          <Button
            onClick={onStartFresh}
            variant="outline"
            className="w-full py-6 text-lg font-semibold rounded-xl border-2"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Start Fresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
