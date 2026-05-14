"use client";

import { Sparkles, MoreHorizontal, Heart, MessageCircle, Share2, Bookmark, ExternalLink } from "lucide-react";
import {
    Card,
    CardFooter,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/card/card-social-post";

export function CardSocialPost() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<Card className="max-w-md">
  <CardHeader className="flex flex-row items-center gap-4 pb-2">
    <Avatar>
      <AvatarFallback>{data.avatarInitials}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{data.name}</span>
        <Badge variant="secondary" className="text-xs">{data.badge}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{data.handle} • {data.timeAgo}</p>
    </div>
    ...
  </CardHeader>
  <CardContent className="pb-2">
    <p className="text-sm">{data.postContent}</p>
    ...
  </CardContent>
  <CardFooter>...</CardFooter>
</Card>`;

    return (
        <ComponentInstall category="card" variant="card-social-post" title="Social Post Card" code={snippet} fullCode={code}>
            <Card className="max-w-md">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar>
                        <AvatarFallback>{data.avatarInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{data.name}</span>
                            <Badge variant="secondary" className="text-xs">{data.badge}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{data.handle} • {data.timeAgo}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pb-2">
                    <p className="text-sm">{data.postContent}</p>
                    <div className="mt-3 rounded-lg overflow-hidden border border-border">
                        <div className="h-32 bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <div className="p-3 bg-muted/30">
                            <p className="font-medium text-sm">{data.linkTitle}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" /> {data.linkUrl}
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                        <Heart className="h-4 w-4" /> {data.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <MessageCircle className="h-4 w-4" /> {data.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <Share2 className="h-4 w-4" /> Share
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </ComponentInstall>
    );
}
