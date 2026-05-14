"use client";

import { MapPin, Star, Clock } from "lucide-react";
import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ComponentInstall } from "@/components/lab/ComponentInstall";
import { code, data } from "@/registry/card/card-profile";

export function CardProfile() {
    const snippet = `const data = ${JSON.stringify(data, null, 2)};

<div className="grid gap-6 md:grid-cols-2 max-w-2xl">
  {data.map((profile, index) => (
    profile.layout === "centered" ? (
      <Card key={index}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-2xl">{profile.avatarInitials}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.role}</p>
            ...
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button className="flex-1">{profile.primaryButton}</Button>
          <Button variant="outline" className="flex-1">{profile.secondaryButton}</Button>
        </CardFooter>
      </Card>
    ) : (
      <Card key={index}>...</Card>
    )
  ))}
</div>`;

    return (
        <ComponentInstall category="card" variant="card-profile" title="Profile Card" code={snippet} fullCode={code}>
            <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
                {data.map((profile, index) =>
                    profile.layout === "centered" ? (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="h-20 w-20 mb-4">
                                        <AvatarFallback className="text-2xl">{profile.avatarInitials}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold text-lg">{profile.name}</h3>
                                    <p className="text-sm text-muted-foreground">{profile.role}</p>
                                    <div className="flex gap-4 mt-4 text-sm">
                                        <div className="text-center">
                                            <p className="font-bold">{profile.stats?.posts}</p>
                                            <p className="text-muted-foreground">Posts</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold">{profile.stats?.followers}</p>
                                            <p className="text-muted-foreground">Followers</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold">{profile.stats?.following}</p>
                                            <p className="text-muted-foreground">Following</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button className="flex-1">{profile.primaryButton}</Button>
                                <Button variant="outline" className="flex-1">{profile.secondaryButton}</Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{profile.avatarInitials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{profile.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {profile.location}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{profile.bio}</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {profile.badges?.map((badge, i) => (
                                        <Badge key={i} variant="secondary">{badge}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="justify-between text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-[hsl(var(--progress-warning))]" /> {profile.rating} rating</span>
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Joined {profile.joined}</span>
                            </CardFooter>
                        </Card>
                    )
                )}
            </div>
        </ComponentInstall>
    );
}
