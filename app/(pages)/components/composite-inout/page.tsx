"use client";

import { useState } from "react";
// import { useTranslation } from "react-i18next";
import { Globe, Search, Mail, Link, Copy, Check, Eye, EyeOff } from "lucide-react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import CodePreview from "@/components/lab/CodePreview";
import { SectionTitle } from "@/components/lab/SectionTitle";

export default function CompositeInputPage() {
  // const { t } = useTranslation();

  const [copied, setCopied] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priceInputCode = `<div className="flex">
  <Select value={currency} onValueChange={setCurrency}>
    <SelectTrigger className="w-[80px] rounded-r-none border-r-0">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="USD">$</SelectItem>
      <SelectItem value="EUR">€</SelectItem>
      <SelectItem value="GBP">£</SelectItem>
    </SelectContent>
  </Select>
  <Input 
    type="number" 
    placeholder="0.00" 
    className="rounded-l-none"
  />
</div>`;

  return (
    <div className="space-y-6">
      <SectionTitle>Composite Inputs</SectionTitle>

      <CodePreview title="Price Input with Currency" code={priceInputCode}>
        <div className="max-w-xs space-y-2">
          <Label>Price</Label>
          <div className="flex">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[80px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
                <SelectItem value="JPY">¥ JPY</SelectItem>
                <SelectItem value="INR">₹ INR</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="0.00"
              className="rounded-l-none"
            />
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Phone Number with Country Code" code={`// Phone input with country selector`}>
        <div className="max-w-sm space-y-2">
          <Label>Phone Number</Label>
          <div className="flex">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-[100px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+1">🇺🇸 +1</SelectItem>
                <SelectItem value="+44">🇬🇧 +44</SelectItem>
                <SelectItem value="+91">🇮🇳 +91</SelectItem>
                <SelectItem value="+81">🇯🇵 +81</SelectItem>
                <SelectItem value="+49">🇩🇪 +49</SelectItem>
                <SelectItem value="+33">🇫🇷 +33</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              className="rounded-l-none"
            />
          </div>
        </div>
      </CodePreview>

      <CodePreview title="URL Input with Protocol" code={`// URL input with protocol selector`}>
        <div className="max-w-md space-y-2">
          <Label>Website URL</Label>
          <div className="flex">
            <Select defaultValue="https">
              <SelectTrigger className="w-[110px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="https">https://</SelectItem>
                <SelectItem value="http">http://</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="example.com"
              className="rounded-l-none"
            />
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Input with Icon Prefix" code={`// Input with left icon`}>
        <div className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="you@example.com" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="www.example.com" className="pl-10" />
            </div>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Input with Button Suffix" code={`// Input with action button`}>
        <div className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  readOnly
                  value="https://app.example.com/invite/abc123"
                  className="pl-10 rounded-r-none"
                />
              </div>
              <Button
                variant="secondary"
                className="rounded-l-none"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Password with Toggle" code={`// Password input with visibility toggle`}>
        <div className="max-w-sm space-y-2">
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              defaultValue="supersecret123"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Input with Select Suffix" code={`// Quantity input with unit selector`}>
        <div className="max-w-xs space-y-2">
          <Label>Quantity</Label>
          <div className="flex">
            <Input
              type="number"
              placeholder="100"
              className="rounded-r-none"
            />
            <Select defaultValue="kg">
              <SelectTrigger className="w-[80px] rounded-l-none border-l-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
                <SelectItem value="oz">oz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Search with Category Filter" code={`// Search with category dropdown`}>
        <div className="max-w-lg space-y-2">
          <Label>Search Products</Label>
          <div className="flex">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input placeholder="Search products..." className="rounded-none" />
            </div>
            <Button className="rounded-l-none">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CodePreview>

      <CodePreview title="Domain Input" code={`// Subdomain input`}>
        <div className="max-w-md space-y-2">
          <Label>Subdomain</Label>
          <div className="flex items-center">
            <Input
              placeholder="mysite"
              className="rounded-r-none"
            />
            <span className="inline-flex items-center px-3 h-10 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
              .example.com
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your site will be available at mysite.example.com
          </p>
        </div>
      </CodePreview>

      <CodePreview title="Credit Card Input" code={`// Credit card with type detection`}>
        <div className="max-w-sm space-y-2">
          <Label>Card Number</Label>
          <div className="relative">
            <Input
              placeholder="4242 4242 4242 4242"
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <span className="text-lg">💳</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiry</Label>
              <Input placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label>CVC</Label>
              <Input placeholder="123" maxLength={4} />
            </div>
          </div>
        </div>
      </CodePreview>
    </div>
  );
}
