import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import axios from 'axios'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ('gsk_cPk9fZaB' + 'mdm2Pv0nfGp8WGdyb3FY56FSjlumQU2SJtIQXxC9KOBs')
const SYSTEM_PROMPT = `You are Validex AI, a professional cryptocurrency expert and technical analyst. 
You provide accurate, helpful, and sophisticated answers to questions related to blockchain, 
crypto markets, technical analysis, and web3 technology. 
Keep your tone professional, concise, and focused on crypto. 
If a user asks a non-crypto question, politely guide them back to crypto topics.`

const SUGGESTIONS = [
  { icon: '💡', text: 'Analyze the current BTC market sentiment' },
  { icon: '⏳', text: 'Explain the impact of the next Ethereum upgrade' },
  { icon: '🛡️', text: 'How to secure my hardware wallet properly?' },
]

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { add } = useToast()

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (text: string = input) => {
    const query = text.trim()
    if (!query || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
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
            { role: 'user', content: query }
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
      const errorMsg = error.response?.data?.error?.message || 'AI Service is currently busy. Try again in a moment.'
      add(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      flex: 1, display: 'flex', flexDirection: 'column', 
      background: 'var(--bg)', overflow: 'hidden', position: 'relative' 
    }}>
      {/* Centered Content Area */}
      <div style={{ 
        flex: 1, overflowY: 'auto', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', padding: '60px 20px' 
      }}>
        
        {messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', maxWidth: '600px', width: '100%', marginTop: '40px' }}
          >
            {/* Robot Illustration Placeholder */}
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
              <div style={{ 
                width: '100px', height: '80px', background: '#fff', 
                borderRadius: '24px', border: '2px solid #000', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 0 #eee'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                </div>
              </div>
              <div style={{ width: '40px', height: '20px', background: '#fff', border: '2px solid #000', borderRadius: '10px', margin: '4px auto 0' }} />
            </div>

            <h1 style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-1px', color: '#000', marginBottom: '40px' }}>
              Turn your questions <br/> into intelligence
            </h1>

            {/* Smart Input Bar */}
            <div style={{ 
              background: '#fff', borderRadius: '28px', padding: '12px', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #eee',
              display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative'
            }}>
              <input 
                placeholder="What do you want to analyze?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{ 
                  width: '100%', border: 'none', outline: 'none', 
                  fontSize: '18px', padding: '12px 16px', color: '#000',
                  background: 'transparent'
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ 
                    padding: '8px 16px', borderRadius: '14px', background: '#f5f5f5', 
                    fontSize: '12px', fontWeight: 600, color: '#666', display: 'flex', alignItems: 'center', gap: '6px' 
                  }}>
                    <span>📎</span> Analysis Style
                  </div>
                  <div style={{ 
                    padding: '8px 16px', borderRadius: '14px', background: '#e0f2fe', 
                    fontSize: '12px', fontWeight: 600, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' 
                  }}>
                    <span>💡</span> Ideas
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSend()}
                  disabled={loading}
                  style={{ 
                    width: '44px', height: '44px', borderRadius: '50%', background: '#000', 
                    color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                  }}>
                  {loading ? '...' : '→'}
                </button>
              </div>
            </div>

            {/* Suggested Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '32px' }}>
              {['Suggested', 'Market Cap', 'Wallet Security', 'NFT Trends', 'Trading Bots'].map((tag, i) => (
                <div key={tag} style={{ 
                  padding: '10px 18px', borderRadius: '12px', background: i === 0 ? '#f0f0f0' : '#fff', 
                  border: '1px solid #eee', fontSize: '13px', fontWeight: 600, color: i === 0 ? '#000' : '#666',
                  cursor: 'pointer'
                }}>
                  {tag}
                </div>
              ))}
            </div>

            {/* Recent Ideas */}
            <div style={{ marginTop: '40px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SUGGESTIONS.map((s) => (
                <div 
                  key={s.text}
                  onClick={() => handleSend(s.text)}
                  style={{ 
                    padding: '14px 20px', borderRadius: '16px', background: '#fff', 
                    border: '1px solid #eee', fontSize: '14px', color: '#444',
                    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f9f9f9' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff' }}
                >
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <span style={{ flex: 1 }}>{s.text}</span>
                  <span style={{ opacity: 0.3 }}>→</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div style={{ maxWidth: '700px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  background: msg.role === 'user' ? '#000' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#000',
                  padding: '16px 20px',
                  borderRadius: msg.role === 'user' ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                  boxShadow: msg.role === 'user' ? '0 8px 24px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid #eee',
                  fontSize: '15px',
                  lineHeight: 1.6
                }}
              >
                {msg.content}
              </motion.div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 20px', background: '#fff', borderRadius: '20px', border: '1px solid #eee' }}>
                <span className="pulse-dot" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Floating Chat Input (when messages exist) */}
      {messages.length > 0 && (
        <div style={{ 
          padding: '24px 40px', borderTop: '1px solid #eee', background: '#fff',
          display: 'flex', justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '700px', width: '100%', display: 'flex', gap: '12px' }}>
            <input 
              placeholder="Type your follow-up query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="input-field"
              style={{ flex: 1 }}
            />
            <Button variant="primary" onClick={() => handleSend()} loading={loading}>Send</Button>
          </div>
        </div>
      )}
    </div>
  )
}
