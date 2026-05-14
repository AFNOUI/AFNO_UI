import path from 'path';
import Link from 'next/link';
import { promises as fs } from 'fs';

import { ArrowRight, Box } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ComponentsPage() {
    let componentNames: string[] = [];

    try {
        const filePath = path.join(process.cwd(), 'public', 'registry', 'index.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        componentNames = JSON.parse(fileContents);
    } catch (error) {
        console.error("Failed to load registry:", error);
    }

    return (
        <div className="min-h-screen">
            <div className="flex items-center gap-2 text-primary font-medium mb-4">
                <Box size={20} />
                <span>Library Registry</span>
            </div>

            {componentNames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {componentNames.map((name) => (
                        <Link key={name} href={`/components/${name}`} className="group">
                            <Card className="h-full transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl capitalize">
                                            {name.replace(/-/g, ' ')}
                                        </CardTitle>

                                        <ArrowRight className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" size={18} />
                                    </div>

                                    <CardDescription className="line-clamp-2">
                                        Fully accessible, reusable {name} logic for your Next.js applications.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl opacity-50">
                    <p className="text-lg">Registry is empty</p>
                </div>
            )}
        </div>
    );
}
