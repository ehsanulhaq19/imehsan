import DOMPurify from "isomorphic-dompurify";

const SANITIZE = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "span",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "code",
    "pre",
  ],
  ALLOWED_ATTR: ["href", "class", "target", "rel"],
};

/** Renders sanitized HTML from trusted admin CMS fields. */
export function SafeRichText({ html, className = "" }: { html: string; className?: string }) {
  const clean = DOMPurify.sanitize(html, SANITIZE);
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
