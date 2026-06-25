import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Как Лариса понимает мои вопросы?",
      answer:
        "Вы можете говорить вслух через микрофон или писать текстом в строке. Лариса распознаёт вопрос и отвечает живым нежным женским голосом.",
    },
    {
      question: "Какой у Ларисы голос?",
      answer:
        "Лариса говорит мягким, тёплым и естественным женским голосом — общение получается приятным и комфортным.",
    },
    {
      question: "Можно ли управлять компьютером через Ларису?",
      answer:
        "Да, Лариса выполняет голосовые команды: открывает приложения, ищет файлы, управляет музыкой и базовыми настройками компьютера.",
    },
    {
      question: "На какие вопросы отвечает Лариса?",
      answer:
        "Лариса отвечает на вопросы любого формата — от бытовых и справочных до сложных. Просто спросите голосом или текстом.",
    },
    {
      question: "Нужно ли печатать, или можно только говорить?",
      answer:
        "Можно и так, и так. Удобно говорить вслух — используйте микрофон. Не хотите говорить — напишите вопрос текстом, ответ всё равно будет озвучен.",
    },
    {
      question: "Лариса запоминает разговор?",
      answer:
        "Да, Лариса поддерживает контекст беседы, поэтому диалог получается естественным и связным, как с настоящим собеседником.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Ответы на популярные вопросы о возможностях Ларисы, голосе и управлении компьютером.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}