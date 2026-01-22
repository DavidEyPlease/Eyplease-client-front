import useAuthStore from "@/store/auth";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Faqs = () => {
    const { utilData } = useAuthStore(state => state)

    return (
        <Card>
            <CardHeader>
                <p className="font-semibold">Preguntas frecuentes</p>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {utilData.faqs.map(faq => (
                        <AccordionItem value={faq.id} key={faq.id}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}

export default Faqs;