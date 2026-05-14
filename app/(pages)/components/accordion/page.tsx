import { AccordionSingle } from "@/components/lab/accordion/AccordionSingle";
import { AccordionMultiple } from "@/components/lab/accordion/AccordionMultiple";

export default function AccordionPage() {
    return (
        <div className="space-y-6">
            <AccordionSingle />
            <AccordionMultiple />
        </div >
    );
}
