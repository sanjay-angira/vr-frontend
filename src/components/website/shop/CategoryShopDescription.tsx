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
        <div dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
        <p>{text}</p>
      )}
    </article>
  );
}
