import type { ParsedCitation } from "@/types/citation"

/**
 * Parses a citation string in the format:
 * CitationCharLocation(cited_text='...', document_index=0, document_title='Detailed Notes', end_char_index=154, start_char_index=0, type='char_location')
 * 
 * @param citationStr - The citation string to parse
 * @returns ParsedCitation object or null if parsing fails
 */
export const parseCitationString = (citationStr: string): ParsedCitation | null => {
  if (!citationStr || typeof citationStr !== 'string') {
    return null
  }

  try {
    // Extract cited_text (handles escaped quotes and newlines)
    const citedTextMatch = citationStr.match(/cited_text='([^']*(?:\\.[^']*)*)'/)
    const citedText = citedTextMatch ? citedTextMatch[1].replace(/\\n/g, '\n').replace(/\\'/g, "'") : ''

    // Extract document_index
    const documentIndexMatch = citationStr.match(/document_index=(\d+)/)
    const documentIndex = documentIndexMatch ? parseInt(documentIndexMatch[1], 10) : 0

    // Extract document_title
    const documentTitleMatch = citationStr.match(/document_title='([^']+)'/)
    const documentTitle = documentTitleMatch ? documentTitleMatch[1] : ''

    // Extract start_char_index
    const startIndexMatch = citationStr.match(/start_char_index=(\d+)/)
    const startIndex = startIndexMatch ? parseInt(startIndexMatch[1], 10) : -1

    // Extract end_char_index
    const endIndexMatch = citationStr.match(/end_char_index=(\d+)/)
    const endIndex = endIndexMatch ? parseInt(endIndexMatch[1], 10) : -1

    // Validate that we have the essential fields
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      return null
    }

    return {
      startIndex,
      endIndex,
      citedText,
      documentIndex,
      documentTitle,
      metCriteria: [], // These will be populated by context if needed
      allCriteria: [] // These will be populated by context if needed
    }
  } catch (error) {
    console.error('Error parsing citation string:', error, citationStr)
    return null
  }
}

