/**
 * Emits a JSON-LD `<script>` block.
 *
 * Server component by design — structured data must be in the initial HTML for
 * crawlers that do not execute JavaScript.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is inserted verbatim; `<` is escaped so a string
      // in the data can never close the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
