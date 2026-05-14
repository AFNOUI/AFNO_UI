"use client";

import { Clock, MapPin } from "lucide-react";
import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/card/card-event";

export function CardEvent() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Card className="max-w-sm">
  <CardHeader className="pb-2">
    <div className="flex items-center gap-3">
      <div className="text-center p-2 bg-primary/10 rounded-lg min-w-[48px]">
        <p className="text-xs font-medium text-primary">{data.dateMonth}</p>
        <p className="text-xl font-bold text-primary">{data.dateDay}</p>
      </div>
      <div>
        <CardTitle className="text-base">{data.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {data.time}
        </CardDescription>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="text-sm text-muted-foreground">
      {data.description}
    </p>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4" />
      <span>{data.location}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Attendees:</span>
      <div className="flex -space-x-2">
        {data.attendees.map((initials, i) => (
          <Avatar key={i} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        ))}
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
          +{data.extraCount}
        </div>
      </div>
    </div>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline" className="flex-1">Decline</Button>
    <Button className="flex-1">Accept</Button>
  </CardFooter>
</Card>`;

    return (
        <ComponentInstall category="card" variant="card-event" title="Event Card" code={snippet} fullCode={code}>
            <Card className="max-w-sm">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                        <div className="text-center p-2 bg-primary/10 rounded-lg min-w-[48px]">
                            <p className="text-xs font-medium text-primary">{data.dateMonth}</p>
                            <p className="text-xl font-bold text-primary">{data.dateDay}</p>
                        </div>
                        <div>
                            <CardTitle className="text-base">{data.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {data.time}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {data.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{data.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Attendees:</span>
                        <div className="flex -space-x-2">
                            {data.attendees.map((initials, i) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                </Avatar>
                            ))}
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                +{data.extraCount}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="gap-2">
                    <Button variant="outline" className="flex-1">Decline</Button>
                    <Button className="flex-1">Accept</Button>
                </CardFooter>
            </Card>
        </ComponentInstall>
    );
}