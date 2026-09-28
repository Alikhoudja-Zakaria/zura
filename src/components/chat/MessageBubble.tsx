'use client'

import { Message } from '@/types'
import { timeAgo, cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn("flex flex-col mb-4 max-w-[80%]", isOwn ? "self-end items-end" : "self-start items-start")}>
      <div
        className={cn(
          "px-4 py-2 text-sm",
          isOwn 
            ? "bg-[#FF4458] text-white rounded-2xl rounded-br-sm" 
            : "bg-white text-[#1A1A2E] rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm"
        )}
      >
        {message.content}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 px-1">
        {timeAgo(message.createdAt)}
      </span>
    </div>
  )
}
