type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/** Renders one or more JSON-LD script tags for SEO schema. */
export function JsonLd({ data }: JsonLdProps) {
  const payloads = Array.isArray(data) ? data : [data];

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={`json-ld-${index}-${String(payload["@type"] || "schema")}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
        />
      ))}
    </>
  );
}
