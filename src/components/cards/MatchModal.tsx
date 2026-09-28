'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserProfile } from '@/types'
import Link from 'next/link'

interface MatchModalProps {
  currentUser: UserProfile
  matchedUser: UserProfile
  onClose: () => void
}

export default function MatchModal({ currentUser, matchedUser, onClose }: MatchModalProps) {
  // Build a match ID the same way createMatch does (sorted)
  const matchId = [currentUser.uid, matchedUser.uid].sort().join('_')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
        >
          <h2 className="mb-2 text-3xl font-bold text-[#FF4458]">It&apos;s a Match! 🎉</h2>
          <p className="mb-8 text-gray-500">You and {matchedUser.name} liked each other.</p>

          <div className="mb-10 flex justify-center">
            <div className="relative flex w-48 justify-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 10, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="z-10 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg bg-gray-100"
              >
                <img
                  src={currentUser.photo1}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: -10, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg bg-gray-100"
              >
                <img
                  src={matchedUser.photo1}
                  alt={matchedUser.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/chat/${matchId}`}
              className="flex w-full items-center justify-center rounded-xl bg-[#FF4458] py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Send a Message
            </Link>
            <button
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl bg-gray-100 py-4 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
