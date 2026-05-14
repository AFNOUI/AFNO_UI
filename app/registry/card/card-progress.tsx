export const data = {
  title: "Project Progress",
  badge: "In Progress",
  description: "Website Redesign",
  progressValue: 75,
  phases: [
    { name: "Design", status: "Complete", statusClass: "text-[hsl(var(--progress-success))]" },
    { name: "Development", status: "In Progress", statusClass: "text-[hsl(var(--progress-warning))]" },
    { name: "Testing", status: "Pending", statusClass: "text-muted-foreground" },
  ],
  dueDate: "Dec 15",
  avatarInitials: ["JD", "SM", "AB"],
};

export const code = `import React from "react";
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

const data = ${JSON.stringify(data, null, 2)};

export default function CardProgressExample() {
  return (
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
  );
}
`;
