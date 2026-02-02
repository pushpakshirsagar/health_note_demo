import { useEffect, useRef } from "react"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { useAppData } from "@/context/AppDataContext"
import { useSearch } from "@/hooks/useSearch"
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, XIcon } from "lucide-react"
import React from "react"

const Inspection = () => {
  const { selectedCitations, noteText, isActive, setIsActive, setSelectedCitations, setSearchQuery, searchQuery } = useAppData()
  const contentRef = useRef<HTMLDivElement>(null)

  // Use search hook for all search functionality
  const {
    searchMatches,
    currentMatchIndex,
    matchRefs,
    handleNextMatch,
    handlePreviousMatch,
    handleSearchKeyDown,
    handleClearSearch,
    citationSearchQuery,
    setCitationSearchQuery,
    citationMatches,
    currentCitationMatchIndex,
    citationMatchRefs,
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


  //scroll to current match
  useEffect(() => {
    if (currentMatchIndex >= 0 && matchRefs.current[currentMatchIndex] && contentRef.current) {
      matchRefs.current[currentMatchIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentMatchIndex, matchRefs])

  useEffect(() => {
    if (currentCitationMatchIndex >= 0 && citationMatchRefs.current[currentCitationMatchIndex] && contentRef.current) {
      citationMatchRefs.current[currentCitationMatchIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentCitationMatchIndex, citationMatchRefs])

  useEffect(() => {
    if (isActive && selectedCitations.length > 0 && contentRef.current && !searchQuery) {
      const firstCitation = selectedCitations[0]
      const element = contentRef.current.querySelector(`[data-citation-start="${firstCitation.startIndex}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedCitations, isActive, searchQuery])

  const renderHighlightedText = () => {

    if (!noteText) return null
    const allHighlights = [
      ...searchMatches.map((m, idx) => ({ ...m, type: 'search' as const, matchIndex: idx })),
      ...citationMatches.map((m, idx) => ({ ...m, type: 'citationSearch' as const, matchIndex: idx }))
    ].sort((a, b) => a.startIndex - b.startIndex)

    if (allHighlights.length === 0) {
      return <div className="text-sm leading-relaxed">{noteText}</div>
    }

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    allHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {noteText.substring(lastIndex, highlight.startIndex)}
          </span>
        )
      }

      // Add highlighted text
      const isCurrentSearchMatch = highlight.type === 'search' && 
        'matchIndex' in highlight && 
        highlight.matchIndex === currentMatchIndex

      const isCurrentCitationMatch = highlight.type === 'citationSearch' && 
        'matchIndex' in highlight && 
        highlight.matchIndex === currentCitationMatchIndex

      const className = highlight.type === 'citationSearch'
        ? isCurrentCitationMatch ? "bg-blue-400": "bg-blue-200"
        : isCurrentSearchMatch   ? "bg-yellow-400" : "bg-yellow-200"

      parts.push(
        <span
          key={`highlight-${idx}`}
          ref={(el) => {
            if (highlight.type === 'search' && 'matchIndex' in highlight) {
              matchRefs.current[highlight.matchIndex] = el
            }
            if (highlight.type === 'citationSearch' && 'matchIndex' in highlight) {
              citationMatchRefs.current[highlight.matchIndex] = el
            }
          }}
          className={className}
        >
          {noteText.substring(highlight.startIndex, highlight.endIndex)}
        </span>
      )

      lastIndex = highlight.endIndex
    })

    if (lastIndex < noteText.length) {
      parts.push(
        <span key="text-end">
          {noteText.substring(lastIndex)}
        </span>
      )
    }

    return <div className="text-sm leading-relaxed">{parts}</div>
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
        className="flex-1 p-4 overflow-y-auto overflow-x-hidden min-h-0 whitespace-pre-wrap"
      >
        {isActive && noteText? (
          <>
            <div className="mb-4 flex items-center justify-end gap-2">
              <InputGroup className="w-1/3 max-w-md">
                <InputGroupInput 
                  type="text" 
                  placeholder="Search in citations..." 
                  value={citationSearchQuery}
                  onChange={(e) => {
                    setCitationSearchQuery(e.target.value)
                  }}
                  onKeyDown={handleCitationSearchKeyDown}
                />
                <InputGroupAddon align="inline-end">
                  <SearchIcon className="w-4 h-4" />
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
                  <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    {currentCitationMatchIndex + 1} of {citationMatches.length}
                  </div>
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
            
            {renderHighlightedText()}

          </>
        ) : <>{renderHighlightedText()}</>}
      </div>
    </div>
  )
}

export default Inspection