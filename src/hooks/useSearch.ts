import React, { useState, useEffect, useRef, useMemo } from "react"
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

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])

  return debounced
}

export const useSearch = ({
  noteText,
  selectedCitations,
  isActive,
  searchQuery,
  setSearchQuery
}: UseSearchProps) => {

  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([])

  const [citationSearchQuery, setCitationSearchQuery] = useState("")
  const [currentCitationMatchIndex, setCurrentCitationMatchIndex] = useState(0)
  const citationMatchRefs = useRef<(HTMLSpanElement | null)[]>([])


const debouncedQuery = useDebouncedValue(searchQuery, 250)

  const searchMatches = useMemo((): SearchMatch[] => {
    if (!debouncedQuery || !noteText) return []
    
    const query = debouncedQuery.toLowerCase()
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
  }, [debouncedQuery, noteText])


  const debouncedCitationQuery = useDebouncedValue(citationSearchQuery, 250)

  const citationMatches = useMemo((): CitationMatch[] => {
    if (!debouncedCitationQuery || selectedCitations.length === 0) return []
    
    const query = debouncedCitationQuery.toLowerCase()
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
  }, [debouncedCitationQuery, selectedCitations])

  useEffect(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex(0)
    } else {
      setCurrentMatchIndex(-1)
    }
  }, [searchQuery, searchMatches.length])

  useEffect(() => {
    if (citationMatches.length > 0) {
      setCurrentCitationMatchIndex(0)
    } else {
      setCurrentCitationMatchIndex(-1)
    }
  }, [citationSearchQuery, citationMatches.length])

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
  }
}

