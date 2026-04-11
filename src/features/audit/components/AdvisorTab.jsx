import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react'
import { auditApi } from '../api/auditApi'

function AdvisorTab({ audit, token }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello! I'm your AI Certification Advisor. I've analyzed the documents for ${audit.hotel?.businessInfo?.name || 'this hotel'}. How can I assist you with the audit today?` }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await auditApi.chatWithHotelData(audit.hotel?._id, { query: input }, token)
      const assistantMessage = { role: 'assistant', text: response.data.answer }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I encountered an error while processing your request. Please ensure documents are processed first.", isError: true }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className='flex h-[600px] flex-col overflow-hidden rounded-2xl bg-white shadow-inner'>
      <div className='flex items-center justify-between border-b border-[#f0f4ff] bg-[#f9fbff]/50 px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-800)] text-white shadow-lg'>
            <Bot size={22} />
          </div>
          <div>
            <h2 className='text-sm font-bold text-[#1f2b49]'>AI Audit Advisor</h2>
            <div className='flex items-center gap-1.5'>
              <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500'></div>
              <p className='text-[10px] font-bold uppercase tracking-wider text-emerald-600'>Active Analysis</p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-1 text-amber-700'>
          <Sparkles size={14} />
          <span className='text-[10px] font-bold'>Powered by RAG</span>
        </div>
      </div>

      <div ref={scrollRef} className='app-scrollbar flex-1 space-y-4 overflow-y-auto p-6'>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                msg.role === 'user' ? 'bg-[#f4f7fc]' : 'bg-[var(--brand-50)]'
              }`}>
                {msg.role === 'user' ? <User size={16} className='text-[#5f6f8c]' /> : <Bot size={16} className='text-[var(--brand-700)]' />}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-[var(--brand-600)] text-white shadow-md rounded-tr-none' 
                  : 'bg-[#f4f7fc] text-[#1f2b49] rounded-tl-none border border-[#eef2f8]'
              } ${msg.isError ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className='flex justify-start'>
            <div className='flex gap-3'>
              <div className='mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-50)]'>
                <Bot size={16} className='text-[var(--brand-700)]' />
              </div>
              <div className='flex items-center gap-1 rounded-2xl bg-[#f4f7fc] px-4 py-3'>
                <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-[#8d98af]'></div>
                <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-[#8d98af]' style={{ animationDelay: '0.2s' }}></div>
                <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-[#8d98af]' style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='border-t border-[#f0f4ff] p-4'>
        <form onSubmit={handleSend} className='relative'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask about sustainability records, business info, or compliance items...'
            className='h-14 w-full rounded-2xl border border-[#dde4f1] bg-[#f9fbff]/50 pl-5 pr-14 text-sm text-[#1f2b49] outline-none transition focus:border-[var(--brand-600)] focus:ring-4 focus:ring-[var(--brand-600)]/10'
          />
          <button 
            type='submit'
            className='absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-600)] text-white shadow-md transition hover:bg-[var(--brand-700)] hover:scale-105 active:scale-95'
          >
            <Send size={18} />
          </button>
        </form>
        <div className='mt-3 flex items-center justify-center gap-2 text-[10px] text-[#8d98af]'>
          <Info size={12} />
          <span>The advisor suggests based on available documentation. Always verify findings manually.</span>
        </div>
      </div>
    </div>
  )
}

export default AdvisorTab
