"use client";

import { Calendar } from "lucide-react";
import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/card/card-progress";

export function CardProgress() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Card className="max-w-sm">
  <CardHeader className="pb-2">
    <div className="flex items-center justify-between">
      <CardTitle className="text-base">{data.title}</CardTitle>
      <Badge variant="secondary">{data.badge}</Badge>
    </div>
    <CardDescription>{data.description}</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Overall Progress</span>
        <span className="font-medium">{data.progressValue}%</span>
      </div>
      <Progress value={data.progressValue} className="h-2" />
    </div>
    <div className="space-y-2">
      {data.phases.map((phase, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span>{phase.name}</span>
          <span className={phase.statusClass}>{phase.status}</span>
        </div>
      ))}
    </div>
  </CardContent>
  <CardFooter className="justify-between text-sm text-muted-foreground">
    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due {data.dueDate}</span>
    <div className="flex -space-x-2">
      {data.avatarInitials.map((initials, i) => (
        <Avatar key={i} className="h-6 w-6 border-2 border-background">
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  </CardFooter>
</Card>`;

    return (
        <ComponentInstall category="card" variant="card-progress" title="Progress Card" code={snippet} fullCode={code}>
            <Card className="max-w-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{data.title}</CardTitle>
                        <Badge variant="secondary">{data.badge}</Badge>
                    </div>
                    <CardDescription>{data.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-medium">{data.progressValue}%</span>
                        </div>
                        <Progress value={data.progressValue} className="h-2" />
                    </div>
                    <div className="space-y-2">
                        {data.phases.map((phase, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span>{phase.name}</span>
                                <span className={phase.statusClass}>{phase.status}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due {data.dueDate}</span>
                    <div className="flex -space-x-2">
                        {data.avatarInitials.map((initials, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </CardFooter>
            </Card>
        </ComponentInstall>
    );
}
