type CategoryShopDescriptionProps = {
  name: string;
  description: string;
};

/** Server-rendered category SEO description below the product grid. */
export function CategoryShopDescription({
  name,
  description,
}: CategoryShopDescriptionProps) {
  const text = description.trim();
  if (!text || !text.replace(/<[^>]*>/g, "").trim()) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  return (
    <article
      className="store-catalog__category-description"
      aria-label={`${name} description`}
    >
      {isHtml ? (
        <div className="ql-snow rich-html store-catalog__category-description-shell">
          <div
            className="ql-editor rich-html store-catalog__category-description-body"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      ) : (
        <p className="store-catalog__category-description-copy">{text}</p>
      )}
    </article>
  );
}
