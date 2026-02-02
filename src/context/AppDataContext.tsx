import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CitationContextType, ParsedCitation } from '@/types/citation'
import dummyResponse from "@/data/dummyResponse.json"

const AppDataContext = createContext<CitationContextType | undefined>(undefined)

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCitations, setSelectedCitationsState] = useState<ParsedCitation[]>([])
  const [noteText, setNoteText] = useState<string>('')
  const [isActive, setIsActive] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("met")

  const metCriteria = dummyResponse.result_json.guideline_report.guidelines.filter((guideline: any) => guideline.criterion_met).sort((a: any, b: any) => a.guideline_number - b.guideline_number)
  const allCriteria = dummyResponse.result_json.guideline_report.guidelines.sort((a: any, b: any) => a.guideline_number - b.guideline_number)

  const setSelectedCitations = (citations: ParsedCitation[], note: string) => {
    console.log('setSelectedCitations', citations, note)
    setSelectedCitationsState(citations)
    setNoteText(note)
    setIsActive(true)
  }

  const clearCitations = () => {
    setSelectedCitationsState([])
    setNoteText('')
    setIsActive(false)
  }

  return (
    <AppDataContext.Provider
      value={{
        selectedCitations,
        noteText,
        isActive,
        setSelectedCitations,
        clearCitations,
        setIsActive,
        setSearchQuery,
        searchQuery,
        activeTab,
        setActiveTab,
        metCriteria,
        allCriteria
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => {
  const context = useContext(AppDataContext)
  if (context === undefined) {
    throw new Error('useAppData must be used within an InspectionProvider')
  }
  return context
}