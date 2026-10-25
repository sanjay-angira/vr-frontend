"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type ProductImage = string;

type Props = {
  images: ProductImage[];
  alt: string;
  topRightSlot?: ReactNode;
};

export default function ProductImageGallery({ images, alt, topRightSlot }: Props) {
  const [current, setCurrent] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const safeImages = images.filter(
    (src): src is string => typeof src === "string" && src.trim().length > 0
  );
  const hasMultiple = safeImages.length > 1;
  const activeIndex = Math.min(current, Math.max(safeImages.length - 1, 0));
  const activeImage = safeImages[activeIndex] ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrent(0);
    setFadeKey((key) => key + 1);
  }, [images]);

  useEffect(() => {
    if (!isZoomed) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsZoomed(false);
      if (event.key === "ArrowLeft" && hasMultiple) {
        setCurrent((index) => (index === 0 ? safeImages.length - 1 : index - 1));
      }
      if (event.key === "ArrowRight" && hasMultiple) {
        setCurrent((index) => (index === safeImages.length - 1 ? 0 : index + 1));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hasMultiple, isZoomed, safeImages.length]);

  const goPrev = () => {
    setCurrent((index) => (index === 0 ? safeImages.length - 1 : index - 1));
    setFadeKey((key) => key + 1);
  };

  const goNext = () => {
    setCurrent((index) => (index === safeImages.length - 1 ? 0 : index + 1));
    setFadeKey((key) => key + 1);
  };

  const selectThumb = (index: number) => {
    setCurrent(index);
    setFadeKey((key) => key + 1);
  };

  if (!activeImage) {
    return (
      <div className="product-gallery">
        <div className="product-gallery__main product-gallery__main--empty">
          <span>No image available</span>
        </div>
      </div>
    );
  }

  const lightbox =
    isZoomed && mounted
      ? createPortal(
          <div
            className="product-gallery__lightbox"
            onClick={() => setIsZoomed(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed product image"
          >
            <button
              type="button"
              className="product-gallery__lightbox-close"
              onClick={() => setIsZoomed(false)}
              aria-label="Close zoom"
            >
              <X size={18} />
            </button>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  className="product-gallery__lightbox-nav product-gallery__lightbox-nav--prev"
                  onClick={(event) => {
                    event.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="product-gallery__lightbox-nav product-gallery__lightbox-nav--next"
                  onClick={(event) => {
                    event.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            <div
              className="product-gallery__lightbox-stage"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                key={`zoom-${activeIndex}-${activeImage}`}
                src={activeImage}
                alt={alt}
                fill
                sizes="90vw"
                className="product-gallery__lightbox-image"
                priority
                unoptimized
              />
            </div>

            {hasMultiple ? (
              <div className="product-gallery__lightbox-counter" aria-hidden="true">
                {activeIndex + 1} / {safeImages.length}
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="product-gallery">
      {lightbox}

      <div className="product-gallery__main">
        {topRightSlot && (
          <div className="product-gallery__top-right">{topRightSlot}</div>
        )}

        <button
          type="button"
          className="product-gallery__zoom-hint"
          onClick={() => setIsZoomed(true)}
          aria-label="Zoom image"
        >
          <ZoomIn size={16} />
          <span>Zoom</span>
        </button>

        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="product-gallery__nav product-gallery__nav--prev"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="product-gallery__nav product-gallery__nav--next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div
          key={fadeKey}
          className="product-gallery__image-frame"
          style={{ position: "absolute", inset: 0 }}
        >
          <Image
            src={activeImage}
            alt={alt}
            fill
            sizes="(max-width: 899px) 100vw, 50vw"
            className="product-gallery__image"
            onClick={() => setIsZoomed(true)}
            priority
            unoptimized
            style={{ objectFit: "cover" }}
          />
        </div>

        {hasMultiple && (
          <div className="product-gallery__counter" aria-hidden="true">
            {activeIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {hasMultiple && (
        <div className="product-gallery__thumbs" role="listbox" aria-label="Product images">
          {safeImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => selectThumb(idx)}
              className={`product-gallery__thumb-button${
                activeIndex === idx ? " is-active" : ""
              }`}
              aria-label={`View image ${idx + 1}`}
              aria-selected={activeIndex === idx}
              role="option"
            >
              <Image
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                fill
                sizes="96px"
                className="product-gallery__thumb-image"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
