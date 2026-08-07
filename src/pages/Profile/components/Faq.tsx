import { useMemo, useState } from "react"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import SearchInput from "@/components/generics/SearchInput"
import { IconHelpCenter } from "@/components/Svg/IconHelpCenter"
import useAuthStore from "@/store/auth"
import { normalizeSearchText } from "@/utils"
import SectionCard from "./SectionCard"

const Faqs = () => {
    const { utilData } = useAuthStore(state => state)
    const [search, setSearch] = useState('')

    /* Búsqueda local sin tildes sobre pregunta y respuesta */
    const faqs = useMemo(() => {
        const query = normalizeSearchText(search.trim())
        if (!query) return utilData.faqs

        return utilData.faqs.filter(faq =>
            normalizeSearchText(`${faq.question} ${faq.answer}`).includes(query)
        )
    }, [utilData.faqs, search])

    return (
        <SectionCard
            icon={<IconHelpCenter aria-hidden />}
            title="Preguntas frecuentes"
            description="Resuelve tus dudas al momento"
        >
            <div className="mb-3 max-w-md">
                <SearchInput placeholder="Buscar una pregunta…" onSubmitSearch={setSearch} />
            </div>

            {faqs.length === 0 ? (
                <p className="py-6 text-center text-sm font-semibold text-muted-foreground">
                    No encontramos preguntas que coincidan con tu búsqueda.
                </p>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map(faq => (
                        <AccordionItem
                            value={faq.id}
                            key={faq.id}
                            className="mb-2 rounded-2xl border px-4 last:border-b data-[state=open]:border-primary/25 data-[state=open]:shadow-card"
                        >
                            <AccordionTrigger className="py-3.5 text-[13px] font-bold tracking-tight hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[12.5px] leading-relaxed font-medium text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </SectionCard>
    )
}

export default Faqs
