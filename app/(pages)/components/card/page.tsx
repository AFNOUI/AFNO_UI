"use client";

// import { useTranslation } from "react-i18next";
import {
    Sparkles, Check, Star, TrendingUp, TrendingDown,
    Users, DollarSign, Activity, ShoppingCart, Bell,
    Zap, Crown, Rocket, MoreHorizontal, ExternalLink,
    Clock, MapPin, Calendar, Heart, MessageCircle, Share2, Bookmark,
} from "lucide-react";

import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import {
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function CardPage() {
    // const { t } = useTranslation();

    const basicCode = `import {
        Card,
        CardContent,
        CardDescription,
        CardFooter,
        CardHeader,
        CardTitle,
      } from "@/components/ui/card";
      
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>`;

    return (
        <div className="space-y-8">
            <SectionTitle>Card</SectionTitle>

            {/* Basic Card */}
            <CodePreview title="Basic Card" code={basicCode}>
                <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Project</CardTitle>
                            <CardDescription>Deploy your new project in one-click.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Project name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="framework">Framework</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="next">Next.js</SelectItem>
                                        <SelectItem value="vite">Vite</SelectItem>
                                        <SelectItem value="remix">Remix</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Cancel</Button>
                            <Button>Deploy</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Manage your notification settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive email updates</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CodePreview>

            {/* Stats Cards */}
            <CodePreview title="Stats Cards" code={`// Dashboard statistics cards`}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,231.89</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-[hsl(var(--progress-success))]" />
                                <span className="text-[hsl(var(--progress-success))]">+20.1%</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+2,350</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-[hsl(var(--progress-success))]" />
                                <span className="text-[hsl(var(--progress-success))]">+180.1%</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Sales</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+12,234</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingDown className="h-3 w-3 text-destructive" />
                                <span className="text-destructive">-4.5%</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+573</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-[hsl(var(--progress-success))]" />
                                <span className="text-[hsl(var(--progress-success))]">+201</span> since last hour
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </CodePreview>

            {/* Pricing Cards */}
            <CodePreview title="Pricing Cards" code={`// Pricing tier cards`}>
                <div className="grid gap-6 md:grid-cols-3 max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Starter
                            </CardTitle>
                            <CardDescription>Perfect for individuals</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />5 projects</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Basic analytics</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Community support</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">Get Started</Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-primary shadow-lg relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary">Most Popular</Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-primary" />
                                Pro
                            </CardTitle>
                            <CardDescription>Best for growing teams</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-4xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Unlimited projects</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Advanced analytics</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Priority support</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Custom integrations</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Subscribe</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5" />
                                Enterprise
                            </CardTitle>
                            <CardDescription>For large organizations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-4xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Everything in Pro</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Dedicated support</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />SLA guarantee</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Custom contracts</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">Contact Sales</Button>
                        </CardFooter>
                    </Card>
                </div>
            </CodePreview>

            {/* User Profile Card */}
            <CodePreview title="Profile Card" code={`// User profile card`}>
                <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-20 w-20 mb-4">
                                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-lg">John Doe</h3>
                                <p className="text-sm text-muted-foreground">Senior Developer</p>
                                <div className="flex gap-4 mt-4 text-sm">
                                    <div className="text-center">
                                        <p className="font-bold">124</p>
                                        <p className="text-muted-foreground">Posts</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold">8.2k</p>
                                        <p className="text-muted-foreground">Followers</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold">256</p>
                                        <p className="text-muted-foreground">Following</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button className="flex-1">Follow</Button>
                            <Button variant="outline" className="flex-1">Message</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback>SM</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-base">Sarah Miller</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    San Francisco, CA
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Product Designer with 8+ years of experience. Passionate about creating beautiful and functional interfaces.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                <Badge variant="secondary">UI/UX</Badge>
                                <Badge variant="secondary">Design Systems</Badge>
                                <Badge variant="secondary">Figma</Badge>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="h-4 w-4 text-[hsl(var(--progress-warning))]" /> 4.9 rating</span>
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Joined 2019</span>
                        </CardFooter>
                    </Card>
                </div>
            </CodePreview>

            {/* Social Post Card */}
            <CodePreview title="Social Post Card" code={`// Social media post card`}>
                <Card className="max-w-md">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar>
                            <AvatarFallback>AB</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">Alex Brown</span>
                                <Badge variant="secondary" className="text-xs">Pro</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">@alexbrown • 2h ago</p>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <p className="text-sm">
                            Just shipped a new feature! 🚀 Really excited about this one - it&apos;s going to make everyone&apos;s workflow so much smoother. Check it out and let me know what you think!
                        </p>
                        <div className="mt-3 rounded-lg overflow-hidden border border-border">
                            <div className="h-32 bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="p-3 bg-muted/30">
                                <p className="font-medium text-sm">New Feature Announcement</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" /> blog.example.com
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                            <Heart className="h-4 w-4" /> 128
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                            <MessageCircle className="h-4 w-4" /> 24
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                            <Share2 className="h-4 w-4" /> Share
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </CodePreview>

            {/* Notification Card */}
            <CodePreview title="Notification Card" code={`// Notification list card`}>
                <Card className="max-w-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </CardTitle>
                            <Button variant="ghost" size="sm">Mark all read</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { avatar: "JD", name: "John Doe", action: "liked your post", time: "2m ago", unread: true },
                            { avatar: "SM", name: "Sarah Miller", action: "commented on your photo", time: "1h ago", unread: true },
                            { avatar: "AB", name: "Alex Brown", action: "started following you", time: "3h ago", unread: false },
                            { avatar: "TC", name: "Tom Chen", action: "mentioned you in a comment", time: "5h ago", unread: false },
                        ].map((notification, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50 ${notification.unread ? 'bg-primary/5' : ''}`}
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="text-xs">{notification.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">
                                        <span className="font-medium">{notification.name}</span>{" "}
                                        <span className="text-muted-foreground">{notification.action}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                                </div>
                                {notification.unread && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">View All Notifications</Button>
                    </CardFooter>
                </Card>
            </CodePreview>

            {/* Progress Card */}
            <CodePreview title="Progress Card" code={`// Task progress card`}>
                <Card className="max-w-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Project Progress</CardTitle>
                            <Badge variant="secondary">In Progress</Badge>
                        </div>
                        <CardDescription>Website Redesign</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-medium">75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Design</span>
                                <span className="text-[hsl(var(--progress-success))]">Complete</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Development</span>
                                <span className="text-[hsl(var(--progress-warning))]">In Progress</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Testing</span>
                                <span className="text-muted-foreground">Pending</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due Dec 15</span>
                        <div className="flex -space-x-2">
                            {["JD", "SM", "AB"].map((initials, i) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    </CardFooter>
                </Card>
            </CodePreview>

            {/* Event Card */}
            <CodePreview title="Event Card" code={`// Event/meeting card`}>
                <Card className="max-w-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="text-center p-2 bg-primary/10 rounded-lg min-w-[48px]">
                                <p className="text-xs font-medium text-primary">DEC</p>
                                <p className="text-xl font-bold text-primary">15</p>
                            </div>
                            <div>
                                <CardTitle className="text-base">Team Standup</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> 10:00 AM - 10:30 AM
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Weekly sync to discuss project updates, blockers, and priorities for the week ahead.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Conference Room A / Zoom</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Attendees:</span>
                            <div className="flex -space-x-2">
                                {["JD", "SM", "AB", "TC"].map((initials, i) => (
                                    <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                                    </Avatar>
                                ))}
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                                    +3
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button variant="outline" className="flex-1">Decline</Button>
                        <Button className="flex-1">Accept</Button>
                    </CardFooter>
                </Card>
            </CodePreview>
        </div>
    );
}
