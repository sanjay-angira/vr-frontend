"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import axios from "axios";
import {
  searchStorefront,
  type StoreSearchCategory,
  type StoreSearchProduct,
  type StoreSearchResult,
} from "@/services/website/searchService";

function isAbortError(error: unknown) {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

type SearchResultsPanelProps = {
  query: string;
  loading: boolean;
  result: StoreSearchResult | null;
  onNavigate: () => void;
  onViewAll: () => void;
};

function ResultThumb({ src, alt }: { src: string; alt: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="header-search__result-thumb" />
  ) : (
    <span className="header-search__result-thumb is-empty" aria-hidden />
  );
}

function SearchResultsPanel({
  query,
  loading,
  result,
  onNavigate,
  onViewAll,
}: SearchResultsPanelProps) {
  const products = result?.products ?? [];
  const categories = result?.categories ?? [];
  const hasHits = products.length > 0 || categories.length > 0;

  return (
    <div className="header-search__results" role="listbox">
      {loading && !result ? (
        <p className="header-search__status">Searching…</p>
      ) : null}

      {!loading && result && !hasHits ? (
        <p className="header-search__status">No matches for “{query}”</p>
      ) : null}

      {products.map((product: StoreSearchProduct) => (
        <Link
          key={`product-${product.id}`}
          href={product.href}
          className="header-search__result"
          role="option"
          onClick={onNavigate}
        >
          <ResultThumb src={product.image} alt="" />
          <span className="header-search__result-copy">
            <span className="header-search__result-name">{product.name}</span>
            {product.category?.name ? (
              <span className="header-search__result-category">
                {product.category.name}
              </span>
            ) : null}
          </span>
        </Link>
      ))}

      {categories.length > 0 ? (
        <>
          <p className="header-search__group">Categories</p>
          {categories.map((category: StoreSearchCategory) => (
            <Link
              key={`category-${category.id}`}
              href={category.href}
              className="header-search__result"
              role="option"
              onClick={onNavigate}
            >
              <ResultThumb src={category.image} alt="" />
              <span className="header-search__result-copy">
                <span className="header-search__result-category">
                  {category.name}
                </span>
              </span>
            </Link>
          ))}
        </>
      ) : null}

      {query ? (
        <button
          type="button"
          className="header-search__view-all"
          onClick={onViewAll}
        >
          See all results for “{query}”
        </button>
      ) : null}
    </div>
  );
}

export function HeaderSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoreSearchResult | null>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setPanelOpen(false);
  }, []);

  const closeAfterNavigate = useCallback(() => {
    setMobileOpen(false);
    setPanelOpen(false);
    setQuery("");
    setResult(null);
  }, []);

  const submitSearch = useCallback(
    (raw = query) => {
      const q = raw.trim();
      if (!q) return;
      closeMobile();
      setQuery("");
      setResult(null);
      router.push(`/products?search=${encodeURIComponent(q)}`);
    },
    [closeMobile, query, router]
  );

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResult(null);
      setLoading(false);
      return;
    }

    setPanelOpen(true);
    setLoading(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchStorefront(q, { signal: controller.signal })
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch((error) => {
          if (isAbortError(error)) return;
          setResult({ query: q, products: [], categories: [] });
          setLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      mobileInputRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) closeMobile();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [closeMobile]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const showResults = panelOpen && query.trim().length > 0;

  const searchForm = (
    inputRef: RefObject<HTMLInputElement | null>,
    id: string
  ) => (
    <form
      className="header-search__form"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
    >
      <Search size={16} aria-hidden className="header-search__icon" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        className="header-search__input"
        placeholder="Search products..."
        value={query}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={showResults}
        onFocus={() => {
          if (query.trim()) setPanelOpen(true);
        }}
        onChange={(event) => setQuery(event.target.value)}
      />
      {query ? (
        <button
          type="button"
          className="header-search__clear"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setResult(null);
            inputRef.current?.focus();
          }}
        >
          <X size={14} aria-hidden />
        </button>
      ) : null}
      <button type="submit" className="header-search__submit">
        Search
      </button>
    </form>
  );

  const results = (
    <SearchResultsPanel
      query={query.trim()}
      loading={loading}
      result={result}
      onNavigate={closeAfterNavigate}
      onViewAll={() => submitSearch()}
    />
  );

  return (
    <div ref={rootRef} className={`header-search${mobileOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="header-search__toggle"
        aria-label="Search"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <Search size={20} />
      </button>

      <div className="header-search__desktop">
        {searchForm(desktopInputRef, "header-search-desktop")}
        {showResults && !mobileOpen ? results : null}
      </div>

      {mobileOpen ? (
        <div className="header-search__overlay">
          <button
            type="button"
            className="header-search__backdrop"
            aria-label="Close search"
            onClick={closeMobile}
          />
          <div className="header-search__sheet">
            <div className="header-search__sheet-bar">
              <button
                type="button"
                className="icon-button"
                aria-label="Close search"
                onClick={closeMobile}
              >
                <X size={20} />
              </button>
              {searchForm(mobileInputRef, "header-search-mobile")}
            </div>
            {showResults ? (
              <div className="header-search__sheet-results">{results}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
