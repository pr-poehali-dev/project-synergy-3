import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Icon from "@/components/ui/icon"

const features = [
  {
    title: "Голос через микрофон",
    description: "Задайте вопрос вслух — Лариса мгновенно распознаёт речь и отвечает живым нежным женским голосом.",
    icon: "Mic",
    badge: "Голос",
  },
  {
    title: "Текстовый ввод",
    description: "Не хотите говорить вслух? Напишите вопрос в строке — и Лариса озвучит ответ красивым голосом.",
    icon: "MessageSquare",
    badge: "Чат",
  },
  {
    title: "Управление компьютером",
    description: "Открыть программу, найти файл, включить музыку — Лариса выполняет команды по голосу за вас.",
    icon: "MonitorSmartphone",
    badge: "Команды",
  },
  {
    title: "Нежный женский голос",
    description: "Приятное естественное звучание, которое делает общение тёплым и комфортным в любой ситуации.",
    icon: "Volume2",
    badge: "Озвучка",
  },
  {
    title: "Ответы на любые вопросы",
    description: "Лариса отвечает на вопросы любого формата — от бытовых до сложных, понятно и по делу.",
    icon: "Sparkles",
    badge: "ИИ",
  },
  {
    title: "Живой диалог",
    description: "Лариса помнит контекст беседы и поддерживает естественный разговор, как настоящий собеседник.",
    icon: "MessagesSquare",
    badge: "Диалог",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Что умеет Лариса</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Голос, текст и управление компьютером — всё в одном умном помощнике
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <Icon name={feature.icon} size={26} />
                  </span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}