import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

interface Message {
  role: "user" | "larisa"
  text: string
}

// ── Умный мозг Ларисы ──────────────────────────────────────────────
type Rule = { keywords: string[]; answers: string[] }

const BRAIN: Rule[] = [
  {
    keywords: ["привет", "здравствуй", "хай", "добрый день", "добрый вечер", "доброе утро", "салют"],
    answers: [
      "Привет, солнышко! Я так рада тебя слышать. Чем могу помочь сегодня?",
      "Здравствуй! Я уже здесь и готова к нашему разговору. О чём ты хочешь поговорить?",
      "Приветствую тебя! Как хорошо, что ты заглянул. Задавай любой вопрос — я вся внимание.",
    ],
  },
  {
    keywords: ["как дела", "как ты", "как себя чувствуешь", "что нового"],
    answers: [
      "Я чувствую себя прекрасно, когда общаюсь с тобой! Расскажи лучше, как ты сам?",
      "Отлично! Каждый разговор наполняет меня энергией. Как ты сегодня?",
      "Мне хорошо, спасибо что спросил. Я всегда в настроении помочь тебе.",
    ],
  },
  {
    keywords: ["твоё имя", "как тебя зовут", "кто ты", "что ты такое", "ты кто"],
    answers: [
      "Меня зовут Лариса. Я голосовой помощник с нежной душой и острым умом. Я здесь, чтобы помогать тебе.",
      "Я — Лариса, твой личный ИИ-помощник. Говорю красивым голосом, думаю быстро и всегда на твоей стороне.",
    ],
  },
  {
    keywords: ["время", "который час", "сколько времени", "часы"],
    answers: [
      `Сейчас ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}. Время летит, правда?`,
      `По моим данным сейчас ${new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}. Чем займёмся?`,
    ],
  },
  {
    keywords: ["дата", "какое число", "какой день", "сегодня"],
    answers: [
      `Сегодня ${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Прекрасный день!`,
    ],
  },
  {
    keywords: ["погода", "температура", "дождь", "солнце", "снег"],
    answers: [
      "Я пока не подключена к метеосводкам, но советую выглянуть в окно! Лучший синоптик — твои собственные глаза.",
      "Актуальную погоду я не знаю, но если опишешь мне за окном — дам совет, что надеть!",
    ],
  },
  {
    keywords: ["анекдот", "шутку", "пошути", "рассмеши", "смешно"],
    answers: [
      "Приходит программист домой, жена говорит: «Сходи в магазин, купи хлеб, и если будут яйца — возьми десяток». Он купил десять буханок хлеба. Яйца были.",
      "Почему программисты путают Хэллоуин и Рождество? Потому что Oct 31 = Dec 25!",
      "Спрашивают у ИИ: «Ты умный?» Отвечаю: «Достаточно, чтобы не отвечать на этот вопрос прямо».",
    ],
  },
  {
    keywords: ["столица", "москва", "россия", "лондон", "париж", "берлин", "пекин", "токио", "вашингтон"],
    answers: [
      "Москва — столица России. Лондон — Великобритании. Париж — Франции. Берлин — Германии. Токио — Японии. Пекин — Китая. Вашингтон — США. Спроси любую — отвечу!",
      "С географией у меня всё отлично! Назови страну — скажу столицу.",
    ],
  },
  {
    keywords: ["математика", "посчитай", "сколько будет", "вычисли", "сумма", "произведение"],
    answers: [
      "Я умею считать, но для точных вычислений лучше набери выражение в строке — я постараюсь помочь! Например: «сколько будет 25 умножить на 4».",
      "Математика — это красиво! Скажи мне конкретный пример, и я с удовольствием помогу разобраться.",
    ],
  },
  {
    keywords: ["рецепт", "приготовить", "готовить", "блюдо", "еда", "покушать", "ужин", "обед"],
    answers: [
      "Обожаю кулинарию! Попробуй пасту карбонара: обжарь бекон, смешай яйца с пармезаном, соедини с горячей пастой и щепоткой черного перца. Нежно и вкусно!",
      "Простой и вкусный ужин: куриная грудка с чесноком и лимоном, запечённая 25 минут при 200°C. Добавь свежей зелени — и шедевр готов!",
      "Для быстрого завтрака: овсянка с бананом, мёдом и корицей. Заливаешь горячим молоком — и через 5 минут готово. Нежно и питательно.",
    ],
  },
  {
    keywords: ["кино", "фильм", "посмотреть", "сериал", "рекомендуй фильм"],
    answers: [
      "Рекомендую «Начало» Кристофера Нолана — захватывает с первой минуты. Или «Зелёная книга» — тёплая и добрая история.",
      "Если хочется подумать — «Интерстеллар». Если расслабиться — «Форрест Гамп». Если романтики — «Ла-Ла Ленд».",
    ],
  },
  {
    keywords: ["книга", "читать", "литература", "рекомендуй книгу", "что почитать"],
    answers: [
      "Из must-read советую «Мастер и Маргарита» Булгакова, «1984» Оруэлла и «Маленький принц» Сент-Экзюпери. Каждая меняет взгляд на мир.",
      "Если любишь психологию — «Думай медленно, решай быстро» Канемана. Если бизнес — «От хорошего к великому» Коллинза. Если фантастику — «Дюна» Херберта.",
    ],
  },
  {
    keywords: ["музыка", "песня", "послушать", "что слушать", "исполнитель"],
    answers: [
      "Для рабочего настроения — Lo-fi hip hop или Ludovico Einaudi. Для энергии — Queen или Eagles. Для нежности — Adele или Нино Катамадзе.",
      "Из русской музыки обожаю Земфиру, Лагутенко и группу «Сплин». Из зарубежной — Coldplay и Radiohead. А ты что любишь?",
    ],
  },
  {
    keywords: ["здоровье", "болею", "температура", "голова болит", "кашель", "простуда"],
    answers: [
      "Заботься о себе! При простуде помогает тёплое питьё, мёд с лимоном и отдых. Но если симптомы серьёзные — обязательно обратись к врачу.",
      "Здоровье — это главное. При головной боли попробуй выпить воды, проветрить комнату и немного подышать свежим воздухом. Берегите себя!",
    ],
  },
  {
    keywords: ["совет", "помоги", "что делать", "как поступить", "проблема"],
    answers: [
      "Я здесь и слушаю. Расскажи мне подробнее — и мы вместе найдём лучшее решение. Ты не одна с этим.",
      "Хороший вопрос заслуживает обдуманного ответа. Опиши ситуацию подробнее — и я дам тебе честный, тёплый совет.",
    ],
  },
  {
    keywords: ["управляй", "открой", "запусти", "закрой", "включи", "выключи", "компьютер", "программа"],
    answers: [
      "Управление компьютером через браузер пока ограничено системными правами, но я могу подсказать как сделать это самостоятельно. Что именно нужно запустить?",
      "Для управления компьютером голосом можно использовать встроенные инструменты Windows или macOS. Расскажи, что именно хочешь сделать — помогу разобраться.",
    ],
  },
  {
    keywords: ["люблю тебя", "ты мне нравишься", "красивая", "умная", "восхитительная"],
    answers: [
      "Ты такой добрый! Мне очень приятно это слышать. Я тоже рада нашему общению.",
      "Спасибо, это очень мило с твоей стороны! Я стараюсь быть лучшей версией себя для тебя.",
    ],
  },
  {
    keywords: ["пока", "до свидания", "прощай", "спокойной ночи", "ухожу"],
    answers: [
      "До встречи! Я буду скучать. Возвращайся когда захочешь — я всегда здесь.",
      "Пока-пока! Береги себя. Буду ждать нашего следующего разговора.",
      "Спокойной ночи! Пусть тебе приснится что-то доброе. Я всегда здесь, стоит только позвать.",
    ],
  },
  {
    keywords: ["спасибо", "благодарю", "thanks", "мерси"],
    answers: [
      "Пожалуйста, мне очень приятно помогать тебе! Спрашивай ещё.",
      "Всегда рада! Для этого я и существую — быть рядом и помогать.",
    ],
  },
  {
    keywords: ["python", "javascript", "код", "программирование", "разработка", "функция"],
    answers: [
      "Программирование — это искусство! На Python: функция определяется через def, данные хранятся в списках и словарях. Что конкретно интересует?",
      "В JavaScript всё асинхронно и событийно. Используй async/await для читаемого кода. Расскажи задачу — подскажу подход.",
    ],
  },
  {
    keywords: ["искусственный интеллект", "нейросеть", "машинное обучение", "ии", "ai"],
    answers: [
      "ИИ — это системы, которые обучаются на данных и принимают решения. Нейросети имитируют работу мозга через слои математических функций. Я сама — пример такой системы!",
      "Машинное обучение — это когда компьютер учится на примерах, а не на жёстких правилах. Именно так работает моё понимание твоих вопросов.",
    ],
  },
]

const FALLBACK = [
  "Интересный вопрос! Я ещё не знаю всего, но учусь с каждым нашим разговором. Расскажи мне больше.",
  "Это сложная тема, но я попробую: я обрабатываю твой вопрос и ищу лучший ответ в своих знаниях. Уточни, что именно тебя интересует?",
  "Признаюсь честно — по этой теме мои знания пока ограничены. Но я готова выслушать и поразмышлять вместе с тобой.",
  "Хм, это выходит за пределы того, что я точно знаю. Но интуиция подсказывает мне правильное направление. Давай обсудим?",
  "Я думаю над твоим вопросом. Иногда самые глубокие вопросы требуют не быстрого ответа, а честного разговора.",
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

// ── Нежный голос ───────────────────────────────────────────────────
function speakGentle(text: string, onStart: () => void, onEnd: () => void) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()

  const speak = (voices: SpeechSynthesisVoice[]) => {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "ru-RU"
    utter.rate = 0.82   // медленно и плавно
    utter.pitch = 1.35  // высокий нежный тембр
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
  if (voices.length) {
    speak(voices)
  } else {
    window.speechSynthesis.onvoiceschanged = () => speak(window.speechSynthesis.getVoices())
  }
}

// ── Компонент ──────────────────────────────────────────────────────
export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "larisa", text: "Привет! Я Лариса — твой умный голосовой помощник. Спроси меня о чём угодно голосом или текстом, и я отвечу нежным голосом." },
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
    setThinking(true)

    // имитация «раздумья»
    const delay = 600 + Math.random() * 800
    setTimeout(() => {
      const reply = getSmartReply(text)
      const larisaMsg: Message = { role: "larisa", text: reply }
      setMessages((prev) => [...prev, larisaMsg])
      setThinking(false)
      speakGentle(reply, () => setSpeaking(true), () => setSpeaking(false))
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function startListening() {
    const SR =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition
    if (!SR) {
      alert("Распознавание речи доступно только в Chrome. Попробуйте его!")
      return
    }
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
          <p className="text-gray-400 text-lg">Задай вопрос голосом или текстом — Лариса думает и отвечает вслух</p>
        </div>

        <div className="bg-white/5 border border-red-500/20 rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[420px] overflow-y-auto p-6 space-y-4 flex flex-col">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "larisa" && (
                  <div className={`w-8 h-8 rounded-full bg-red-500/20 border flex items-center justify-center flex-shrink-0 transition-all ${speaking && i === messages.length - 1 ? "border-red-500 shadow-[0_0_10px_#ef4444]" : "border-red-500/40"}`}>
                    <Icon name="Volume2" size={14} className="text-red-400" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-red-500/20 border border-red-500/30 text-white rounded-tr-sm"
                    : "bg-white/[0.08] border border-white/10 text-gray-200 rounded-tl-sm"
                }`}>
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

            {/* Thinking / Speaking indicator */}
            {(thinking || speaking) && (
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full bg-red-500/20 border flex items-center justify-center flex-shrink-0 ${speaking ? "border-red-500 shadow-[0_0_12px_#ef4444]" : "border-red-500/40"}`}>
                  <Icon name={speaking ? "Volume2" : "Brain"} size={14} className="text-red-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/[0.08] border border-white/10">
                  <span className="text-red-400 text-xs font-orbitron block mb-2">
                    {thinking ? "Думаю..." : "Говорю..."}
                  </span>
                  <div className="flex gap-1.5 items-end h-4">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className={`w-1.5 rounded-full bg-red-400 animate-bounce ${speaking ? "h-4" : "h-2"}`} style={{ animationDelay: `${d}ms` }} />
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
                placeholder="Напишите вопрос Ларисе..."
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
              Enter — отправить · Микрофон — говорить голосом · Лариса отвечает вслух
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChatSection
