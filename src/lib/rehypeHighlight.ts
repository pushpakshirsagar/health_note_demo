import { findAndReplace, type FindAndReplaceList } from "hast-util-find-and-replace"
import type { Root } from "hast"

export interface RehypeHighlightOptions {
  searchQuery: string
  citationHighlightTexts: string[]
  currentSearchMatchIndex?: number
  currentCitationMatchIndex?: number
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function createHighlightSpan(
  value: string,
  type: "search" | "citation",
  index: number,
  currentSearchMatchIndex: number,
  currentCitationMatchIndex: number
): { type: "element"; tagName: "span"; properties: Record<string, unknown>; children: Array<{ type: "text"; value: string }> } {
  const isSearch = type === "search"
  const isCurrentSearch = isSearch && index === currentSearchMatchIndex
  const isCurrentCitation = !isSearch && index === currentCitationMatchIndex
  const searchClass = isCurrentSearch ? "highlight-search highlight-search-current bg-yellow-200" : "highlight-search bg-yellow-200"
  const citationClass = isCurrentCitation ? "highlight-citation highlight-citation-current bg-blue-200" : "highlight-citation bg-blue-200"
  return {
    type: "element",
    tagName: "span",
    properties: {
      className: isSearch ? searchClass : citationClass,
      ...(isSearch ? { "data-search-match-index": String(index) } : { "data-citation-match-index": String(index) }),
    },
    children: [{ type: "text", value }],
  }
}

export function rehypeHighlight(options: RehypeHighlightOptions) {
  const { searchQuery, citationHighlightTexts, currentSearchMatchIndex = -1, currentCitationMatchIndex = -1 } = options
  const searchTrimmed = searchQuery?.trim() ?? ""
  const counters = { searchIndex: 0, citationIndex: 0 }

  const pairs: Array<[RegExp | string, (value: string, ...args: unknown[]) => ReturnType<typeof createHighlightSpan> | string]> = []

  if (searchTrimmed) {
    const searchRegex = new RegExp(escapeRegex(searchTrimmed), "gi")
    pairs.push([
      searchRegex,
      (value: string) => createHighlightSpan(value, "search", counters.searchIndex++, currentSearchMatchIndex, currentCitationMatchIndex),
    ])
  }

  for (const text of citationHighlightTexts) {
    const trimmed = text?.trim()
    if (!trimmed) continue
    pairs.push([
      trimmed,
      (value: string) => createHighlightSpan(value, "citation", counters.citationIndex++, currentSearchMatchIndex, currentCitationMatchIndex),
    ])
  }

  return (tree: Root) => {
    if (pairs.length === 0) return
    findAndReplace(tree, pairs as FindAndReplaceList)
  }
}
