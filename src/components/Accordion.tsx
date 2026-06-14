"use client";
import { useMemo, useRef, useState } from "react";

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  allowMultipleOpen?: boolean;
  className?: string;
};

function AccordionRow({ item, isOpen, onToggle }: { item: AccordionItem; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const maxHeight = useMemo(() => {
    const h = contentRef.current?.scrollHeight ?? 0;
    return isOpen ? `${h}px` : "0px";
  }, [isOpen]);

  return (
    <div className={`accordion-item ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className="accordion-header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`acc-${item.id}`}
      >
        <span className="accordion-question">{item.question}</span>
        <span className={`accordion-icon`} aria-hidden>{isOpen ? "−" : "+"}</span>
      </button>
      <div
        id={`acc-${item.id}`}
        className="accordion-panel"
        style={{ maxHeight, opacity: isOpen ? 1 : 0 }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="accordion-answer">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function Accordion({ items, allowMultipleOpen = false, className }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultipleOpen) {
        return isOpen ? prev.filter(x => x !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  }

  return (
    <div className={`accordion ${className ?? ""}`.trim()}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          isOpen={openIds.includes(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}


