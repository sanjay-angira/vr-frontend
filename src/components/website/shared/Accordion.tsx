"use client";

import { useState } from "react";

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

function AccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`accordion-item${isOpen ? " open" : ""}`}>
      <button
        type="button"
        className="accordion-header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`acc-${item.id}`}
      >
        <span className="accordion-question">{item.question}</span>
        <span
          className={`accordion-icon${isOpen ? " is-open" : ""}`}
          aria-hidden
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        id={`acc-${item.id}`}
        className="accordion-panel"
        aria-hidden={!isOpen}
      >
        <div className="accordion-panel-inner">
          <div
            className="accordion-answer rich-html"
            dangerouslySetInnerHTML={{ __html: item.answer }}
          />
        </div>
      </div>
    </div>
  );
}

export function Accordion({
  items,
  allowMultipleOpen = false,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultipleOpen) {
        return isOpen ? prev.filter((entry) => entry !== id) : [...prev, id];
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
