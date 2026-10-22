import { fromMarkdown } from "mdast-util-from-markdown";
import type { Nodes } from "mdast";

const URL_WITH_PORT_HINT = /https?:\/\/[^\s/:]+:\d/;
const URL_WITH_PORT = /https?:\/\/[^\s/:<>]+:\d[^\s<>]*/g;
const TRAILING_PUNCTUATION = /[.,;:!?]$/;
const PROTECTED_NODES = new Set(["code", "inlineCode", "link", "image", "definition", "html"]);

/** md4c's permissive autolinks stop before a port, so wrap those URLs explicitly. */
export function autolinkUrlsWithPort(source: string): string {
  if (!URL_WITH_PORT_HINT.test(source)) return source;
  const protectedRanges: { start: number; end: number }[] = [];
  function findProtected(node: Nodes) {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (PROTECTED_NODES.has(node.type) && start !== undefined && end !== undefined) {
      protectedRanges.push({ start, end });
    } else if ("children" in node) node.children.forEach(findProtected);
  }
  findProtected(fromMarkdown(source));
  return source.replace(URL_WITH_PORT, (match, offset: number) => {
    if (protectedRanges.some(({ start, end }) => offset >= start && offset < end)) return match;
    const url = trimTrailingPunctuation(match);
    return `<${url}>${match.slice(url.length)}`;
  });
}

function trimTrailingPunctuation(url: string): string {
  let end = url.length;
  while (end > 0) {
    const last = url[end - 1];
    if (TRAILING_PUNCTUATION.test(last)) end--;
    else if (last === ")" && hasUnmatchedClosingParenthesis(url.slice(0, end))) end--;
    else break;
  }
  return url.slice(0, end);
}

function hasUnmatchedClosingParenthesis(url: string): boolean {
  return url.split(")").length > url.split("(").length;
}
