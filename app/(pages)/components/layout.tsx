import { ScrollArea } from "@/components/ui/scroll-area";

import { LayoutHeader } from "./layoutHeader";

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen p-4 md:p-6 lg:p-8 space-y-6">
            <LayoutHeader />

            <div className="bg-muted/20 rounded-lg overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mask-[linear-gradient(to_bottom,white,transparent)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>

                <ScrollArea className="h-full custom-scrollbar">
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        {children}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
