"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "./card";

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export function AccordionItem({
  question,
  answer,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-left font-semibold leading-none tracking-tight">
            {question}
          </h3>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{answer}</p>
        </CardContent>
      )}
    </Card>
  );
}

interface AccordionProps {
  items: AccordionItemProps[];
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <AccordionItem key={index} {...item} />
      ))}
    </div>
  );
}

