export interface ParsedCitation {
    startIndex: number
    endIndex: number
    citedText: string
    documentIndex: number
    documentTitle: string,
    metCriteria: Guideline[]
    allCriteria: Guideline[]
  }
  
  export interface CitationContextType {
    metCriteria: Guideline[]
    allCriteria: Guideline[]
    selectedCitations: ParsedCitation[]
    noteText: string
    isActive: boolean
    setSelectedCitations: (citations: ParsedCitation[], noteText: string) => void
    clearCitations: () => void,
    setIsActive: (isActive: boolean) => void,
    setSearchQuery: (searchQuery: string) => void
    searchQuery: string,
    activeTab: string,
    setActiveTab: (activeTab: string) => void
  }

  export interface Guideline {
    guideline_number: string
    report: string
    citations?: string[]
  }