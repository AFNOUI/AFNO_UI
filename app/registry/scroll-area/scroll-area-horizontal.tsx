export const data = [
  { title: "Abstract Waves", artist: "John Doe", price: "$299" },
  { title: "Mountain Sunset", artist: "Jane Smith", price: "$450" },
  { title: "City Nights", artist: "Mike Chen", price: "$375" },
  { title: "Ocean Dreams", artist: "Sarah Lee", price: "$520" },
  { title: "Forest Path", artist: "Tom Wilson", price: "$280" },
  { title: "Desert Storm", artist: "Anna Brown", price: "$390" },
];

const dataStr = JSON.stringify(data, null, 2);

export const code = `"use client";

import { Star } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const artworks = ${dataStr};

export default function ScrollAreaHorizontalExample() {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {artworks.map((artwork, i) => (
          <figure key={i} className="shrink-0">
            <div className="overflow-hidden rounded-md">
              <div className="aspect-3/4 w-[150px] bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary/50" />
              </div>
            </div>
            <figcaption className="pt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{artwork.title}</span>
              <br />
              {artwork.artist} · {artwork.price}
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
`;
