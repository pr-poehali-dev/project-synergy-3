import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

interface Message {
  role: "user" | "larisa"
  text: string
}

const LARISA_REPLIES = [
  "Привет, я здесь. Задай мне любой вопрос — я с удовольствием отвечу.",
  "Интересный вопрос! Дай мне секунду, чтобы подготовить для тебя лучший ответ.",
  "Я тебя слышу. Вот что я думаю по этому поводу...",
  "Отличная мысль! Позволь мне развернуть ответ подробнее.",
  "Конечно, я помогу. Для меня нет тем, на которые я не могу ответить.",
]

function getReply() {
  return LARISA_REPLIES[Math.floor(Math.random() * LARISA_REPLIES.length)]
}

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "larisa", text: "Привет! Я Лариса — твой голосовой помощник. Спроси меня о чём угодно голосом или текстом." },
  ])
  const [input, setInput] = useState("")
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function speakText(text: string) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ru-RU"
    utter.rate = 0.95
    utter.pitch = 1.2
    const voices = window.speechSynthesis.getVoices()
    const female = voices.find(
      (v) => v.lang.startsWith("ru") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("алиса") || v.name.toLowerCase().includes("милена") || v.name.toLowerCase().includes("victoria") || v.name.includes("Google русский"))
    )
    if (female) utter.voice = female
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }

  function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: "user", text: text.trim() }
    const reply = getReply()
    const larisaMsg: Message = { role: "larisa", text: reply }
    setMessages((prev) => [...prev, userMsg, larisaMsg])
    setInput("")
    setTimeout(() => speakText(reply), 300)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function startListening() {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает распознавание речи. Попробуйте Chrome.")
      return
    }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = "ru-RU"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      sendMessage(transcript)
    }
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <section id="chat" className="py-24 px-4 bg-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
              <circle cx="20" cy="20" r="4" fill="#ef4444"/>
              <circle cx="8" cy="8" r="2.5" fill="#ef4444" opacity="0.7"/>
              <circle cx="32" cy="8" r="2.5" fill="#ef4444" opacity="0.7"/>
              <circle cx="8" cy="32" r="2.5" fill="#ef4444" opacity="0.7"/>
              <circle cx="32" cy="32" r="2.5" fill="#ef4444" opacity="0.7"/>
              <circle cx="20" cy="5" r="2" fill="#ff6b6b" opacity="0.6"/>
              <circle cx="20" cy="35" r="2" fill="#ff6b6b" opacity="0.6"/>
              <circle cx="5" cy="20" r="2" fill="#ff6b6b" opacity="0.6"/>
              <circle cx="35" cy="20" r="2" fill="#ff6b6b" opacity="0.6"/>
              <line x1="8" y1="8" x2="20" y2="20" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
              <line x1="32" y1="8" x2="20" y2="20" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
              <line x1="8" y1="32" x2="20" y2="20" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
              <line x1="32" y1="32" x2="20" y2="20" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
              <line x1="20" y1="5" x2="20" y2="20" stroke="#ff6b6b" strokeWidth="0.8" opacity="0.4"/>
              <line x1="20" y1="35" x2="20" y2="20" stroke="#ff6b6b" strokeWidth="0.8" opacity="0.4"/>
              <line x1="5" y1="20" x2="20" y2="20" stroke="#ff6b6b" strokeWidth="0.8" opacity="0.4"/>
              <line x1="35" y1="20" x2="20" y2="20" stroke="#ff6b6b" strokeWidth="0.8" opacity="0.4"/>
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-orbitron">Поговори с Ларисой</h2>
          </div>
          <p className="text-gray-400 text-lg">Задай вопрос голосом или текстом — Лариса ответит вслух</p>
        </div>

        {/* Chat window */}
        <div className="bg-white/5 border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4 flex flex-col">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "larisa" && (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                    <Icon name="Volume2" size={14} className="text-red-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-red-500/20 border border-red-500/30 text-white rounded-tr-sm"
                      : "bg-white/8 border border-white/10 text-gray-200 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "larisa" && (
                    <span className="text-red-400 text-xs font-orbitron block mb-1">Лариса</span>
                  )}
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={14} className="text-white/60" />
                  </div>
                )}
              </div>
            ))}
            {speaking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                  <Icon name="Volume2" size={14} className="text-red-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/8 border border-white/10">
                  <span className="text-red-400 text-xs font-orbitron block mb-1">Лариса</span>
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-red-500/20 p-4 bg-black/40">
            {listening && (
              <div className="flex items-center gap-2 mb-3 text-red-400 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-orbitron text-xs tracking-wider">СЛУШАЮ...</span>
              </div>
            )}
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите вопрос Ларисе..."
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 resize-none focus:outline-none focus:border-red-500/50 text-sm leading-relaxed"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="bg-red-500 hover:bg-red-600 text-white border-0 h-12 w-12 p-0 rounded-xl flex-shrink-0"
              >
                <Icon name="Send" size={18} />
              </Button>
              <Button
                onClick={listening ? stopListening : startListening}
                className={`h-12 w-12 p-0 rounded-xl flex-shrink-0 border-0 transition-all ${
                  listening
                    ? "bg-red-600 animate-pulse"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Icon name={listening ? "MicOff" : "Mic"} size={18} />
              </Button>
            </div>
            <p className="text-white/20 text-xs mt-2 text-center">Enter — отправить · Микрофон — говорить · Лариса отвечает голосом</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChatSection
