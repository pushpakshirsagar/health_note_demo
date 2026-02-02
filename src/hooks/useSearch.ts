import { useState, useEffect, useRef, useMemo } from "react"
import type { ParsedCitation } from "@/types/citation"

interface SearchMatch {
  startIndex: number
  endIndex: number
}

interface CitationMatch {
  citationIndex: number
  startIndex: number
  endIndex: number
}

interface UseSearchProps {
  noteText: string
  selectedCitations: ParsedCitation[]
  isActive: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useSearch = ({
  noteText,
  selectedCitations,
  isActive,
  searchQuery,
  setSearchQuery
}: UseSearchProps) => {
  // Note search state
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Citation search state
  const [citationSearchQuery, setCitationSearchQuery] = useState("")
  const [currentCitationMatchIndex, setCurrentCitationMatchIndex] = useState(0)
  const citationMatchRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Find all search matches in note text
  const searchMatches = useMemo((): SearchMatch[] => {
    if (!searchQuery || !noteText) return []
    
    const query = searchQuery.toLowerCase()
    const text = noteText.toLowerCase()
    const matches: SearchMatch[] = []
    let startIndex = 0

    while (true) {
      const index = text.indexOf(query, startIndex)
      if (index === -1) break
      matches.push({
        startIndex: index,
        endIndex: index + query.length
      })
      startIndex = index + 1
    }

    return matches
  }, [searchQuery, noteText])

  // Find all citation matches (search in citation text)
  const citationMatches = useMemo((): CitationMatch[] => {
    if (!citationSearchQuery || selectedCitations.length === 0) return []
    
    const query = citationSearchQuery.toLowerCase()
    const matches: CitationMatch[] = []
    
    selectedCitations.forEach((citation, citationIdx) => {
      const citationText = citation.citedText.toLowerCase()
      let startIndex = 0
      
      while (true) {
        const index = citationText.indexOf(query, startIndex)
        if (index === -1) break
        matches.push({
          citationIndex: citationIdx,
          startIndex: citation.startIndex + index,
          endIndex: citation.startIndex + index + query.length
        })
        startIndex = index + 1
      }
    })
    
    return matches.sort((a, b) => a.startIndex - b.startIndex)
  }, [citationSearchQuery, selectedCitations])

  // Reset current match when search changes
  useEffect(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex(0)
    } else {
      setCurrentMatchIndex(-1)
    }
  }, [searchQuery, searchMatches.length])

  // Reset current citation match when citation search changes
  useEffect(() => {
    if (citationMatches.length > 0) {
      setCurrentCitationMatchIndex(0)
    } else {
      setCurrentCitationMatchIndex(-1)
    }
  }, [citationSearchQuery, citationMatches.length])

  // Set default citation search query to first citation's text when citations are loaded
  useEffect(() => {
    if (isActive && selectedCitations.length > 0) {
      const firstCitation = selectedCitations[0]
      if (firstCitation.citedText && citationSearchQuery === "") {
        setCitationSearchQuery(firstCitation.citedText)
      }
    }
  }, [isActive, selectedCitations.length])

  // Navigation handlers
  const handleNextMatch = () => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % searchMatches.length)
    }
  }

  const handlePreviousMatch = () => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + searchMatches.length) % searchMatches.length)
    }
  }

  const handleNextCitationMatch = () => {
    if (citationMatches.length > 0) {
      setCurrentCitationMatchIndex((prev) => (prev + 1) % citationMatches.length)
    }
  }

  const handlePreviousCitationMatch = () => {
    if (citationMatches.length > 0) {
      setCurrentCitationMatchIndex((prev) => (prev - 1 + citationMatches.length) % citationMatches.length)
    }
  }

  // Keyboard handlers
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePreviousMatch()
      } else {
        handleNextMatch()
      }
    }
  }

  const handleCitationSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePreviousCitationMatch()
      } else {
        handleNextCitationMatch()
      }
    }
  }

  // Clear handlers
  const handleClearSearch = () => {
    setSearchQuery("")
    setCurrentMatchIndex(0)
  }

  const handleClearCitationSearch = () => {
    setCitationSearchQuery("")
    setCurrentCitationMatchIndex(0)
  }

  return {
    // Note search
    searchMatches,
    currentMatchIndex,
    matchRefs,
    handleNextMatch,
    handlePreviousMatch,
    handleSearchKeyDown,
    handleClearSearch,
    
    // Citation search
    citationSearchQuery,
    setCitationSearchQuery,
    citationMatches,
    currentCitationMatchIndex,
    citationMatchRefs,
    handleNextCitationMatch,
    handlePreviousCitationMatch,
    handleCitationSearchKeyDown,
    handleClearCitationSearch
  }
}

