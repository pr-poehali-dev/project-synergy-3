import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Елена Соколова",
    role: "Фрилансер, копирайтер",
    avatar: "/professional-woman-scientist.png",
    content:
      "Голос у Ларисы невероятно приятный — слушать одно удовольствие. Спрашиваю её обо всём, пока готовлю или работаю.",
  },
  {
    name: "Максим Орлов",
    role: "Разработчик",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "Управляю компьютером голосом, не отрываясь от кода. Лариса открывает программы и ищет файлы быстрее, чем я мышкой.",
  },
  {
    name: "Анна Ковалёва",
    role: "Маркетолог",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "Можно говорить вслух, можно писать текстом — ответ всегда озвучен красивым голосом. Лариса стала моим личным ассистентом.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Что говорят о Ларисе</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Отзывы людей, которые уже общаются с Ларисой каждый день
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}