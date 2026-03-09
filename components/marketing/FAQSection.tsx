import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

// PHASE 1: TYPES & STATIC DATA
export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

// PHASE 3: COMPONENT ARCHITECTURE
const FAQSection = ({ faqData }: { faqData: FAQItem[] }) => {
    return (
        <section className="w-full py-16 px-4">
            <h2 className="text-3xl font-extrabold mb-8 text-foreground">
                Perguntas Frequentes (FAQ)
            </h2>

            {/* PHASE 2: SHADCN ACCORDION OVERRIDES */}
            <div className="flex flex-col gap-4">
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqData.map((item) => (
                        <AccordionItem
                            key={item.id}
                            value={item.id}
                            className="border border-custom rounded-xl px-6 bg-background overflow-hidden"
                        >
                            <AccordionTrigger className="font-bold text-foreground hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQSection;
