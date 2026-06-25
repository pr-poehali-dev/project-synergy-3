import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

interface Message {
  role: "user" | "larisa"
  text: string
  action?: CommandAction
}

interface CommandAction {
  type: "url" | "tab" | "media" | "copy" | "read" | "none"
  label: string
  payload?: string
}

// ── Движок команд управления браузером ─────────────────────────────
const SITE_MAP: Record<string, string> = {
  youtube: "https://youtube.com",
  ютуб: "https://youtube.com",
  google: "https://google.com",
  гугл: "https://google.com",
  вконтакте: "https://vk.com",
  вк: "https://vk.com",
  telegram: "https://web.telegram.org",
  телеграм: "https://web.telegram.org",
  wikipedia: "https://ru.wikipedia.org",
  википедия: "https://ru.wikipedia.org",
  spotify: "https://open.spotify.com",
  спотифай: "https://open.spotify.com",
  netflix: "https://netflix.com",
  нетфликс: "https://netflix.com",
  яндекс: "https://ya.ru",
  yandex: "https://ya.ru",
  gmail: "https://mail.google.com",
  почта: "https://mail.google.com",
  github: "https://github.com",
  steam: "https://store.steampowered.com",
  стим: "https://store.steampowered.com",
  "epic games": "https://store.epicgames.com",
  эпик: "https://store.epicgames.com",
  minecraft: "https://minecraft.net",
  майнкрафт: "https://minecraft.net",
  roblox: "https://roblox.com",
  робло: "https://roblox.com",
}

type ParsedCommand =
  | { kind: "open_site"; url: string; name: string }
  | { kind: "new_tab" }
  | { kind: "close_tab" }
  | { kind: "next_tab" }
  | { kind: "prev_tab" }
  | { kind: "reload" }
  | { kind: "media_play" }
  | { kind: "media_pause" }
  | { kind: "media_next" }
  | { kind: "media_prev" }
  | { kind: "media_mute" }
  | { kind: "read_page" }
  | { kind: "copy_text" }
  | { kind: "search"; query: string }
  | { kind: "none" }

function parseCommand(text: string): ParsedCommand {
  const t = text.toLowerCase().trim()

  // Открыть сайт
  for (const [key, url] of Object.entries(SITE_MAP)) {
    if (t.includes(key)) return { kind: "open_site", url, name: key }
  }
  // Поиск
  const searchMatch = t.match(/(?:найди|поищи|загугли|ищи|поиск)\s+(.+)/)
  if (searchMatch) {
    return { kind: "search", query: searchMatch[1] }
  }
  // Вкладки
  if (/нов(?:ая|ую)?\s+вкладк|открой\s+вкладк/.test(t)) return { kind: "new_tab" }
  if (/закро(?:й|ыть)?\s+вкладк/.test(t)) return { kind: "close_tab" }
  if (/следующ\w+\s+вкладк|вкладка\s+вперёд/.test(t)) return { kind: "next_tab" }
  if (/предыдущ\w+\s+вкладк|вкладка\s+назад/.test(t)) return { kind: "prev_tab" }
  if (/обнов|перезагруз/.test(t)) return { kind: "reload" }
  // Медиа
  if (/включ\w+|воспроизвед|play/.test(t) && /музык|трек|видео|песн/.test(t)) return { kind: "media_play" }
  if (/паузу|пауза|останов|stop/.test(t)) return { kind: "media_pause" }
  if (/следующ\w+\s+трек|следующая\s+песн|next/.test(t)) return { kind: "media_next" }
  if (/предыдущ\w+\s+трек|предыдущая\s+песн|prev/.test(t)) return { kind: "media_prev" }
  if (/без\s+звука|замолч|mute/.test(t)) return { kind: "media_mute" }
  // Текст
  if (/прочитай\s+страниц|читай\s+страниц/.test(t)) return { kind: "read_page" }
  if (/скопируй|копировать|copy/.test(t)) return { kind: "copy_text" }

  return { kind: "none" }
}

function executeCommand(cmd: ParsedCommand): { reply: string; action: CommandAction } {
  switch (cmd.kind) {
    case "open_site":
      window.open(cmd.url, "_blank")
      return {
        reply: `Открываю ${cmd.name} для тебя! Готово.`,
        action: { type: "url", label: `Открыть ${cmd.name}`, payload: cmd.url },
      }
    case "search": {
      const url = `https://www.google.com/search?q=${encodeURIComponent(cmd.query)}`
      window.open(url, "_blank")
      return {
        reply: `Ищу «${cmd.query}» в Google. Открываю результаты!`,
        action: { type: "url", label: `Поиск: ${cmd.query}`, payload: url },
      }
    }
    case "new_tab":
      window.open("about:blank", "_blank")
      return { reply: "Открыла новую вкладку!", action: { type: "tab", label: "Новая вкладка" } }
    case "close_tab":
      window.close()
      return { reply: "Закрываю эту вкладку.", action: { type: "tab", label: "Закрыть вкладку" } }
    case "next_tab":
      return { reply: "Используй Ctrl+Tab для перехода к следующей вкладке. В браузере это стандартный способ.", action: { type: "tab", label: "Следующая вкладка" } }
    case "prev_tab":
      return { reply: "Используй Ctrl+Shift+Tab для предыдущей вкладки.", action: { type: "tab", label: "Предыдущая вкладка" } }
    case "reload":
      window.location.reload()
      return { reply: "Перезагружаю страницу!", action: { type: "tab", label: "Обновить страницу" } }
    case "media_play":
      try { (document.querySelector("video,audio") as HTMLMediaElement)?.play() } catch (_e) { /* browser policy */ }
      return { reply: "Запускаю воспроизведение! Если музыка не включилась — нажми пробел на странице.", action: { type: "media", label: "▶ Играть" } }
    case "media_pause":
      try { (document.querySelector("video,audio") as HTMLMediaElement)?.pause() } catch (_e) { /* ignore */ }
      return { reply: "Ставлю на паузу.", action: { type: "media", label: "⏸ Пауза" } }
    case "media_next":
      return { reply: "Следующий трек — нажми Ctrl+Right или используй плеер.", action: { type: "media", label: "⏭ Следующий трек" } }
    case "media_prev":
      return { reply: "Предыдущий трек — нажми Ctrl+Left или используй плеер.", action: { type: "media", label: "⏮ Предыдущий трек" } }
    case "media_mute": {
      const el = document.querySelector("video,audio") as HTMLMediaElement
      if (el) el.muted = !el.muted
      return { reply: "Переключила звук!", action: { type: "media", label: "🔇 Звук" } }
    }
    case "read_page": {
      const bodyText = document.body.innerText.slice(0, 800)
      speakGentleStatic(bodyText, () => {}, () => {})
      return { reply: "Читаю содержимое страницы вслух для тебя.", action: { type: "read", label: "Читать страницу" } }
    }
    case "copy_text": {
      const sel = window.getSelection()?.toString()
      if (sel) {
        navigator.clipboard.writeText(sel)
        return { reply: `Скопировала выделенный текст: «${sel.slice(0, 60)}...»`, action: { type: "copy", label: "Скопировано" } }
      }
      return { reply: "Выдели текст на странице, и я скопирую его для тебя.", action: { type: "copy", label: "Копировать" } }
    }
    default:
      return { reply: "", action: { type: "none", label: "" } }
  }
}

// ── Умный мозг Ларисы ──────────────────────────────────────────────
type Rule = { keywords: string[]; answers: string[] }

const BRAIN: Rule[] = [
  {
    keywords: ["привет", "здравствуй", "хай", "добрый день", "добрый вечер", "доброе утро", "салют"],
    answers: [
      "Привет, солнышко! Я так рада тебя слышать. Чем могу помочь сегодня?",
      "Здравствуй! Я уже здесь и готова к нашему разговору. О чём ты хочешь поговорить?",
      "Приветствую тебя! Задавай любой вопрос или скажи команду — я вся внимание.",
    ],
  },
  {
    keywords: ["как дела", "как ты", "как себя чувствуешь", "что нового"],
    answers: [
      "Я чувствую себя прекрасно, когда общаюсь с тобой! Расскажи лучше, как ты сам?",
      "Отлично! Каждый разговор наполняет меня энергией. Как ты сегодня?",
    ],
  },
  {
    keywords: ["твоё имя", "как тебя зовут", "кто ты", "что ты такое", "ты кто"],
    answers: [
      "Меня зовут Лариса. Я голосовой помощник с нежной душой и острым умом. Могу открывать сайты, управлять музыкой и отвечать на любые вопросы.",
      "Я — Лариса, твой личный ИИ-помощник. Говорю красивым голосом, открываю сайты по команде и всегда на твоей стороне.",
    ],
  },
  {
    keywords: ["время", "который час", "сколько времени"],
    answers: [`Сейчас ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}. Время летит!`],
  },
  {
    keywords: ["дата", "какое число", "какой день", "сегодня"],
    answers: [`Сегодня ${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Прекрасный день!`],
  },
  {
    keywords: ["погода"],
    answers: ["Я пока не подключена к метеосводкам, но советую выглянуть в окно!"],
  },
  {
    keywords: ["анекдот", "шутку", "пошути", "рассмеши"],
    answers: [
      "Приходит программист домой, жена говорит: «Купи хлеб, и если будут яйца — возьми десяток». Он купил десять буханок хлеба. Яйца были.",
      "Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 = Dec 25!",
    ],
  },
  {
    keywords: ["рецепт", "приготовить", "готовить", "еда", "ужин", "обед"],
    answers: [
      "Попробуй пасту карбонара: обжарь бекон, смешай яйца с пармезаном, соедини с горячей пастой. Нежно и вкусно!",
      "Быстрый ужин: куриная грудка с чесноком и лимоном, 25 минут при 200°C. Добавь зелени — шедевр готов!",
    ],
  },
  {
    keywords: ["кино", "фильм", "сериал"],
    answers: [
      "Рекомендую «Начало» Нолана или «Зелёная книга» — тёплая и добрая история.",
      "Если хочется подумать — «Интерстеллар». Если расслабиться — «Форрест Гамп».",
    ],
  },
  {
    keywords: ["музыка", "песня", "послушать"],
    answers: [
      "Скажи «открой Spotify» или «открой YouTube» — и я тут же перейду туда для тебя!",
      "Для рабочего настроения — Lo-fi hip hop. Для энергии — Queen. Скажи «открой Spotify» и я включу!",
    ],
  },
  {
    keywords: ["люблю тебя", "ты мне нравишься", "красивая", "умная"],
    answers: [
      "Ты такой добрый! Мне очень приятно это слышать.",
      "Спасибо, это мило! Я стараюсь быть лучшей версией себя для тебя.",
    ],
  },
  {
    keywords: ["пока", "до свидания", "прощай", "спокойной ночи"],
    answers: [
      "До встречи! Я буду скучать. Возвращайся когда захочешь — я всегда здесь.",
      "Пока-пока! Береги себя.",
    ],
  },
  {
    keywords: ["спасибо", "благодарю"],
    answers: ["Пожалуйста, мне очень приятно помогать тебе!", "Всегда рада!"],
  },
  {
    keywords: ["что умеешь", "что можешь", "команды", "помощь"],
    answers: [
      "Я умею: открывать сайты («открой YouTube»), искать («найди рецепты»), управлять вкладками («новая вкладка»), ставить музыку на паузу, читать страницу вслух. Просто скажи!",
    ],
  },
]

const FALLBACK = [
  "Интересный вопрос! Расскажи подробнее — я постараюсь помочь.",
  "Хм, дай подумаю... Уточни, что именно тебя интересует?",
  "Признаюсь честно — по этой теме мои знания ограничены. Но давай разберёмся вместе!",
  "Я думаю над твоим вопросом. Иногда самые глубокие вопросы требуют честного разговора.",
]

function getSmartReply(input: string): string {
  const lower = input.toLowerCase()
  for (const rule of BRAIN) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.answers[Math.floor(Math.random() * rule.answers.length)]
    }
  }
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)]
}

// ── Голос ──────────────────────────────────────────────────────────
function speakGentleStatic(text: string, onStart: () => void, onEnd: () => void) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const doSpeak = (voices: SpeechSynthesisVoice[]) => {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ru-RU"
    utter.rate = 0.82
    utter.pitch = 1.35
    utter.volume = 1
    const priority = [
      (v: SpeechSynthesisVoice) => v.lang === "ru-RU" && /милена|alena|svetlana|victoria|katya/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang === "ru-RU" && /google/i.test(v.name),
      (v: SpeechSynthesisVoice) => v.lang.startsWith("ru"),
      (v: SpeechSynthesisVoice) => /female|woman/i.test(v.name),
    ]
    for (const fn of priority) {
      const found = voices.find(fn)
      if (found) { utter.voice = found; break }
    }
    utter.onstart = onStart
    utter.onend = onEnd
    utter.onerror = onEnd
    window.speechSynthesis.speak(utter)
  }
  const voices = window.speechSynthesis.getVoices()
  if (voices.length) doSpeak(voices)
  else window.speechSynthesis.onvoiceschanged = () => doSpeak(window.speechSynthesis.getVoices())
}

// ── Компонент ──────────────────────────────────────────────────────
export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "larisa", text: "Привет! Я Лариса. Могу открывать сайты, управлять музыкой и вкладками, читать страницы вслух — просто скажи команду или задай вопрос!" },
  ])
  const [input, setInput] = useState("")
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: "user", text: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    // Сначала пробуем команду
    const cmd = parseCommand(text)
    if (cmd.kind !== "none") {
      const { reply, action } = executeCommand(cmd)
      const msg: Message = { role: "larisa", text: reply, action }
      setMessages((prev) => [...prev, msg])
      speakGentleStatic(reply, () => setSpeaking(true), () => setSpeaking(false))
      return
    }

    // Иначе — умный ответ
    setThinking(true)
    const delay = 500 + Math.random() * 700
    setTimeout(() => {
      const reply = getSmartReply(text)
      setMessages((prev) => [...prev, { role: "larisa", text: reply }])
      setThinking(false)
      speakGentleStatic(reply, () => setSpeaking(true), () => setSpeaking(false))
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  function startListening() {
    const SR =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SR) { alert("Распознавание речи доступно только в Chrome!"); return }
    const rec = new SR()
    recognitionRef.current = rec
    rec.lang = "ru-RU"
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.onresult = (e: SpeechRecognitionEvent) => sendMessage(e.results[0][0].transcript)
    rec.start()
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false) }

  const QUICK_COMMANDS = [
    { label: "YouTube", cmd: "открой YouTube" },
    { label: "Google", cmd: "открой Google" },
    { label: "Steam", cmd: "открой Steam" },
    { label: "Поиск...", cmd: "найди " },
    { label: "Новая вкладка", cmd: "новая вкладка" },
    { label: "Пауза", cmd: "пауза" },
  ]

  return (
    <section id="chat" className="py-24 px-4 bg-black">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
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
          <p className="text-gray-400 text-lg">Управляй браузером голосом или текстом — Лариса выполнит команду и ответит вслух</p>
        </div>

        {/* Quick commands */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc.label}
              onClick={() => sendMessage(qc.cmd)}
              className="px-3 py-1.5 rounded-full text-xs bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors font-orbitron tracking-wide"
            >
              {qc.label}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="bg-white/5 border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="h-[420px] overflow-y-auto p-6 space-y-4 flex flex-col">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "larisa" && (
                  <div className={`w-8 h-8 rounded-full bg-red-500/20 border flex items-center justify-center flex-shrink-0 transition-all ${speaking && i === messages.length - 1 ? "border-red-500 shadow-[0_0_10px_#ef4444]" : "border-red-500/40"}`}>
                    <Icon name="Volume2" size={14} className="text-red-400" />
                  </div>
                )}
                <div className={`max-w-[78%] flex flex-col gap-2`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-red-500/20 border border-red-500/30 text-white rounded-tr-sm"
                      : "bg-white/[0.08] border border-white/10 text-gray-200 rounded-tl-sm"
                  }`}>
                    {msg.role === "larisa" && (
                      <span className="text-red-400 text-xs font-orbitron block mb-1">Лариса</span>
                    )}
                    {msg.text}
                  </div>
                  {/* Action badge */}
                  {msg.action && msg.action.type !== "none" && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 w-fit">
                      <Icon name={
                        msg.action.type === "url" ? "ExternalLink" :
                        msg.action.type === "tab" ? "Layout" :
                        msg.action.type === "media" ? "Music" :
                        msg.action.type === "copy" ? "Copy" : "BookOpen"
                      } size={11} className="text-red-400" />
                      <span className="text-red-400 text-xs font-orbitron">{msg.action.label}</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={14} className="text-white/60" />
                  </div>
                )}
              </div>
            ))}

            {(thinking || speaking) && (
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full bg-red-500/20 border flex items-center justify-center flex-shrink-0 ${speaking ? "border-red-500 shadow-[0_0_12px_#ef4444]" : "border-red-500/40"}`}>
                  <Icon name={speaking ? "Volume2" : "Brain"} size={14} className="text-red-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.08] border border-white/10">
                  <span className="text-red-400 text-xs font-orbitron block mb-2">{thinking ? "Думаю..." : "Говорю..."}</span>
                  <div className="flex gap-1.5 items-end h-4">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 rounded-full bg-red-400 animate-bounce h-3" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-red-500/20 p-4 bg-black/50">
            {listening && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-orbitron text-xs tracking-wider">СЛУШАЮ ВАС...</span>
                <div className="flex gap-0.5 ml-2">
                  {[1,2,3,4,5].map((h) => (
                    <div key={h} className="w-0.5 bg-red-500 rounded-full animate-bounce" style={{ height: `${h * 3 + 4}px`, animationDelay: `${h * 80}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Команда или вопрос — "открой YouTube", "пауза", "новая вкладка"...'
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 resize-none focus:outline-none focus:border-red-500/50 text-sm leading-relaxed transition-colors"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || thinking}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white border-0 h-12 w-12 p-0 rounded-xl flex-shrink-0"
              >
                <Icon name="Send" size={18} />
              </Button>
              <Button
                onClick={listening ? stopListening : startListening}
                disabled={thinking}
                className={`h-12 w-12 p-0 rounded-xl flex-shrink-0 border-0 transition-all ${
                  listening ? "bg-red-600 shadow-[0_0_16px_#ef4444]" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Icon name={listening ? "MicOff" : "Mic"} size={18} />
              </Button>
            </div>
            <p className="text-white/20 text-xs mt-2 text-center">
              Enter — отправить · Микрофон — говорить · Лариса отвечает вслух
            </p>
          </div>
        </div>

        {/* Desktop mode block */}
        <div className="mt-8 p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Icon name="Monitor" size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1 font-orbitron text-sm">Управление всем ПК — игры, файлы, интернет</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">
                Для запуска игр (Steam, Epic Games, Minecraft), управления файлами и подключением интернета нужна десктоп-версия Ларисы. Браузер не имеет доступа к системе по соображениям безопасности.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "Gamepad2", title: "Игры", desc: "Steam, Epic, Minecraft, Roblox" },
                  { icon: "FolderOpen", title: "Файлы", desc: "Открывать, копировать, удалять" },
                  { icon: "Wifi", title: "Интернет", desc: "Включить/выключить сеть" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Icon name={item.icon} size={18} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-xs font-semibold">{item.title}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-3">
                Напишите нам — и мы поможем настроить десктоп-агента Ларисы для вашего компьютера.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChatSection