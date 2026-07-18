"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  allowMultipleOpen?: boolean;
  className?: string;
  showIndex?: boolean;
};

function AccordionRow({
  item,
  index,
  isOpen,
  onToggle,
  showIndex,
}: {
  item: AccordionItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  showIndex: boolean;
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
        {showIndex && (
          <span className="accordion-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span className="accordion-question">{item.question}</span>
        <span
          className={`accordion-icon${isOpen ? " is-open" : ""}`}
          aria-hidden
        >
          <ChevronDown size={18} strokeWidth={2.25} />
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
  showIndex = false,
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
      {items.map((item, index) => (
        <AccordionRow
          key={item.id}
          item={item}
          index={index}
          showIndex={showIndex}
          isOpen={openIds.includes(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </div>
  );
}
