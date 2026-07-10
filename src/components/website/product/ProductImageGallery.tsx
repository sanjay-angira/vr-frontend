"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

type ProductImage = string;

type Props = {
  images: ProductImage[];
  alt: string;
  topRightSlot?: ReactNode;
};

export default function ProductImageGallery({ images, alt, topRightSlot }: Props) {
  const [current, setCurrent] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const hasMultiple = images.length > 1;

  const goPrev = () => setCurrent((index) => (index === 0 ? images.length - 1 : index - 1));
  const goNext = () => setCurrent((index) => (index === images.length - 1 ? 0 : index + 1));

  return (
    <div className="product-gallery">
      {isZoomed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            padding: "2rem",
          }}
          onClick={() => setIsZoomed(false)}
        >
          <div
            style={{
              position: "relative",
              width: "min(92vw, 900px)",
              height: "min(88vh, 900px)",
            }}
          >
            <button
              onClick={() => setIsZoomed(false)}
              style={{
                position: "absolute",
                top: -40,
                right: 0,
                background: "white",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              ×
            </button>
            <Image src={images[current]} alt={alt} fill sizes="90vw" style={{ objectFit: "contain" }} />
          </div>
        </div>
      )}

      <div className="product-gallery__main">
        {topRightSlot && (
          <div className="product-gallery__top-right">{topRightSlot}</div>
        )}

        {hasMultiple && (
          <>
            <button
              aria-label="Previous image"
              onClick={goPrev}
              className="btn btn-outline btn-sm product-gallery__nav product-gallery__nav--prev"
            >
              ‹
            </button>
            <button
              aria-label="Next image"
              onClick={goNext}
              className="btn btn-outline btn-sm product-gallery__nav product-gallery__nav--next"
            >
              ›
            </button>
          </>
        )}

        <Image
          src={images[current]}
          alt={alt}
          fill
          sizes="(max-width: 899px) 100vw, 50vw"
          style={{
            borderRadius: 12,
            objectFit: "contain",
            cursor: "zoom-in",
          }}
          onClick={() => setIsZoomed(true)}
        />
      </div>

      {hasMultiple && (
        <div className="product-gallery__thumbs">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => setCurrent(idx)}
              className="product-gallery__thumb-button"
              style={{
                border: current === idx ? "2px solid var(--text-saffron)" : "1px solid #ddd",
              }}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                fill
                sizes="96px"
                style={{ objectFit: "contain", borderRadius: 10 }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
