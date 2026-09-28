'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeToMessages, sendMessage, getMatchById, getUserProfile } from '@/lib/firestore'
import { Message, Match, UserProfile } from '@/types'
import { MessageBubble } from '@/components/chat/MessageBubble'
import ReportModal from '@/components/ui/ReportModal'
import { CountryFlag } from '@/components/ui/CountryFlag'
import { ArrowLeft, Send, Flag, Sparkles } from 'lucide-react'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.matchId as string
  const { user } = useAuth()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [match, setMatch] = useState<Match | null>(null)
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadMatch() {
      if (!matchId || !user) return
      try {
        const matchData = await getMatchById(matchId)
        setMatch(matchData)
        if (matchData) {
          const otherUserId = matchData.user1Id === user.uid ? matchData.user2Id : matchData.user1Id
          const profile = await getUserProfile(otherUserId)
          setOtherUser(profile)
        }
      } catch (error) {
        console.error("Failed to load match:", error)
      } finally {
        setLoading(false)
      }
    }
    loadMatch()
  }, [matchId, user])

  useEffect(() => {
    if (!matchId) return
    const unsubscribe = subscribeToMessages(matchId, (newMessages) => {
      setMessages(newMessages)
    })
    return () => unsubscribe()
  }, [matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !matchId) return
    
    const content = newMessage.trim()
    setNewMessage('')
    try {
      await sendMessage(matchId, user.uid, content)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#FAFAFA]">
        <div className="h-16 bg-white border-b flex items-center px-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="ml-3 w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="w-2/3 h-10 bg-gray-200 rounded-2xl rounded-bl-sm"></div>
          <div className="w-1/2 h-10 bg-gray-200 rounded-2xl rounded-br-sm self-end ml-auto"></div>
        </div>
      </div>
    )
  }

  if (!match || !user) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 mb-4">Chat not found</p>
        <button
          onClick={() => router.push('/matches')}
          className="px-4 py-2 bg-[#FF4458] text-white rounded-xl text-sm font-semibold"
        >
          Back to Matches
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] max-w-5xl mx-auto border-x border-gray-100">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/matches')}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#1A1A2E]" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {otherUser?.photo1 && (
                  <img src={otherUser.photo1} alt={otherUser.name} className="w-full h-full object-cover" />
                )}
              </div>
              {otherUser?.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-[#1A1A2E] leading-tight">{otherUser?.name || "Match"}</h2>
                {otherUser?.country && (
                  <CountryFlag country={otherUser.country} size="xs" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{otherUser?.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>

        {otherUser && (
          <button
            onClick={() => setShowReport(true)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            title={`Report ${otherUser.name}`}
          >
            <Flag className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="m-auto text-center p-6 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-[#FF4458]/10 text-[#FF4458] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-[#1A1A2E] text-base mb-1">It's a new match!</h3>
            <p className="text-gray-400 text-xs mb-4">Break the ice and start the conversation:</p>
            
            <div className="flex flex-col gap-2">
              {[
                "Salam! Kifach rak? 👋",
                "Marhaba! Nice to meet you 🌟",
                `What's your favorite spot in ${otherUser?.city || 'town'}? ☕`,
                "What kind of music are you into? 🎵",
              ].map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewMessage(starter)}
                  className="px-3.5 py-2 bg-white border border-gray-200 hover:border-[#FF4458] hover:bg-[#FF4458]/5 text-[#1A1A2E] rounded-xl text-xs font-medium transition-all text-left shadow-xs"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isOwn={message.senderId === user.uid} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/20 focus:border-[#FF4458]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#FF4458] text-white px-5 rounded-xl hover:bg-[#FF4458]/90 disabled:opacity-50 transition-colors flex items-center justify-center shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {otherUser && (
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          reportedUserId={otherUser.uid}
          reportedUserName={otherUser.name}
        />
      )}
    </div>
  )
}
