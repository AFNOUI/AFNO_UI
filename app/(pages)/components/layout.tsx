import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { LayoutHeader } from "./layoutHeader";

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full min-w-0 max-w-full flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 gap-4 sm:gap-6">
            <LayoutHeader>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mask-[linear-gradient(to_bottom,white,transparent)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>

                <ScrollArea className="h-full min-h-0 custom-scrollbar w-full min-w-0">
                    {children}
                    <ScrollBar orientation="vertical" />
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </LayoutHeader>
        </div>
    )
}
