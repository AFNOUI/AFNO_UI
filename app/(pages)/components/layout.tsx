import { ScrollArea } from "@/components/ui/scroll-area";

import { LayoutHeader } from "./layoutHeader";

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <LayoutHeader />

            <div className="bg-muted/20 rounded-lg overflow-hidden min-h-[600px]">
                <ScrollArea className="h-full custom-scrollbar">
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        {children}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
