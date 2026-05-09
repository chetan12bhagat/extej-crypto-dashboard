import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import axios from 'axios'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const SYSTEM_PROMPT = `You are Validex AI, a professional cryptocurrency expert and technical analyst. 
You provide accurate, helpful, and sophisticated answers to questions related to blockchain, 
crypto markets, technical analysis, and web3 technology. 
Keep your tone professional, concise, and focused on crypto. 
If a user asks a non-crypto question, politely guide them back to crypto topics.`

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am Validex AI. How can I help you with your crypto queries today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { add } = useToast()

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.choices[0].message.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Groq API Error:', error)
      add('Failed to get a response from AI. Please check your connection.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '21px', fontWeight: 800 }}>AI Chat Assistant</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted2)', marginTop: '3px' }}>Powered by Validex Intelligence</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--green)', fontWeight: 600 }}>
          <div className="pulse-dot" />
          System Online
        </div>
      </div>

      <div className="card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        background: '#0a0a0a',
        border: '1px solid var(--border2)'
      }}>
        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  background: msg.role === 'user' ? 'var(--bg3)' : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' ? '1px solid var(--border2)' : '1px solid var(--border)',
                  color: msg.role === 'user' ? '#fff' : 'var(--muted2)',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                {msg.content}
                <div style={{ 
                  fontSize: '10px', 
                  opacity: 0.5, 
                  marginTop: '6px', 
                  textAlign: msg.role === 'user' ? 'right' : 'left' 
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '18px 18px 18px 2px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border)',
                display: 'flex',
                gap: '4px'
              }}>
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border2)', background: '#070707' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input
              placeholder="Ask anything about crypto..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ flex: 1 }}
            />
            <Button 
              variant="primary" 
              onClick={handleSend} 
              loading={loading}
              style={{ padding: '0 24px' }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
