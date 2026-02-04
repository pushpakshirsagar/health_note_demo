import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { rehypeHighlight } from "@/lib/rehypeHighlight"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/context/AppDataContext"
import { useSearch } from "@/hooks/useSearch"
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, XIcon } from "lucide-react"

const Inspection = () => {
  const { selectedCitations, noteText, isActive, setIsActive, setSelectedCitations, setSearchQuery, searchQuery } = useAppData()
  const contentRef = useRef<HTMLDivElement>(null)

  // Use search hook for all search functionality
  const {
    searchMatches,
    currentMatchIndex,
    handleNextMatch,
    handlePreviousMatch,
    handleSearchKeyDown,
    handleClearSearch,
    debouncedSearchQuery,
    citationSearchQuery,
    citationMatches,
    currentCitationMatchIndex,
    handleNextCitationMatch,
    handlePreviousCitationMatch,
    handleCitationSearchKeyDown,
    handleClearCitationSearch,
  } = useSearch({
    noteText,
    selectedCitations,
    isActive,
    searchQuery,
    setSearchQuery,
  })


  // Scroll to current search match (highlights from rehype plugin use data-search-match-index)
  useEffect(() => {
    if (currentMatchIndex < 0 || !contentRef.current || !searchQuery) return
    const el = contentRef.current.querySelector<HTMLElement>(`[data-search-match-index="${currentMatchIndex}"]`)
    el?.scrollIntoView({ behavior: "auto", block: "start" })
  }, [currentMatchIndex, searchQuery])

  useEffect(() => {
    if (!isActive || selectedCitations.length === 0 || !contentRef.current || searchQuery) return
    const scrollToFirst = () => {
      if (!contentRef.current) return
      const byDataIndex = contentRef.current.querySelector<HTMLElement>(`[data-citation-match-index="0"]`)
      if (byDataIndex) {
        byDataIndex.scrollIntoView({ behavior: "auto", block: "start" })
        return
      }
      const noteEl = contentRef.current.querySelector<HTMLElement>("[data-note-content]")
      if (!noteEl) return
      const target = findElementContainingText(noteEl, selectedCitations[0].citedText)
      if (target) target.scrollIntoView({ behavior: "auto", block: "start" })
    }
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToFirst)
    })
    return () => cancelAnimationFrame(rafId)
  }, [selectedCitations, isActive, searchQuery, citationMatches.length])

  // Find DOM element that contains the given text (used for scroll-to-citation after markdown/HTML render)
  const findElementContainingText = (root: HTMLElement, searchText: string): HTMLElement | null => {
    const normalized = searchText.trim().replace(/\s+/g, " ")
    for (const len of [80, 40, 20]) {
      const chunk = normalized.slice(0, len)
      if (!chunk) continue
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
      let node: Node | null = walker.nextNode()
      while (node) {
        const text = (node.textContent ?? "").replace(/\s+/g, " ")
        if (text.includes(chunk)) return node.parentElement as HTMLElement
        node = walker.nextNode()
      }
    }
    return null
  }

  const citationHighlightTexts = citationMatches.map((m) => noteText.slice(m.startIndex, m.endIndex))

  const renderNoteContent = () => {
    if (!noteText) return null
    const rehypePlugins = [
      rehypeRaw,
      [rehypeHighlight, { searchQuery: debouncedSearchQuery ?? "", citationHighlightTexts, currentSearchMatchIndex: currentMatchIndex, currentCitationMatchIndex }],
    ]
    return (
      <div
        data-note-content
        className="[&_.highlight-search]:bg-yellow-200 [&_.highlight-search-current]:bg-yellow-400 [&_.highlight-citation]:bg-blue-200 [&_.highlight-citation-current]:bg-blue-400"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={rehypePlugins as import("unified").PluggableList}>{noteText}</ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border rounded-md overflow-hidden">
      <div className="p-4 border-b flex justify-end mt-16 shrink-0">
        <div className="flex items-center gap-2 w-1/2 max-w-md">
          <InputGroup className="flex-1">
            <InputGroupInput 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              onKeyDown={handleSearchKeyDown}
            />
            <InputGroupAddon align="inline-end">
              <SearchIcon className="w-4 h-4" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleClearSearch}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              )}
            </InputGroupAddon>
          </InputGroup>
          
          {searchQuery && searchMatches.length > 0 && (
            <div className="flex gap-0.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                {currentMatchIndex + 1} of {searchMatches.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-6"
                onClick={handlePreviousMatch}
                disabled={searchMatches.length === 0}
              >
                <ChevronUpIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-6"
                onClick={handleNextMatch}
                disabled={searchMatches.length === 0}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div 
        ref={contentRef}
        className="flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        {noteText && (
          <>
            {isActive && (
              <div className="p-4 pb-0 flex items-center justify-end gap-2 shrink-0">
                <InputGroup className="w-1/3 max-w-md">
                  <InputGroupInput 
                    type="text" 
                    placeholder={`Source ${currentCitationMatchIndex + 1} of ${citationMatches.length}`} 
                    value={`Source ${currentCitationMatchIndex + 1} of ${citationMatches.length}`} 
                  />
                  <InputGroupAddon align="inline-end">
                    {citationSearchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={()=>{
                          handleClearCitationSearch();
                         setSelectedCitations([], noteText);
                        setIsActive(false);
                        }}
                      >
                        <XIcon className="w-3 h-3" />
                      </Button>
                    )}
                  </InputGroupAddon>
                </InputGroup>
                
                {citationSearchQuery && citationMatches.length > 0 && (
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-6"
                      onClick={handlePreviousCitationMatch}
                      disabled={citationMatches.length === 0}
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-6"
                      onClick={handleNextCitationMatch}
                      disabled={citationMatches.length === 0}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 whitespace-pre-wrap">
              {renderNoteContent()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Inspection