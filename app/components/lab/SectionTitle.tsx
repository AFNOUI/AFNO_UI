import { Sparkles } from "lucide-react";

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            {children}
        </h2>
    );
}
