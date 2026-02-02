import { useMemo } from 'react'
import { parseCitationString } from '@/lib/citationUtils'
import type { ParsedCitation } from '@/types/citation'

export const parsedCitations = (citationStrings: string[]) => {
  const parsedCitations = useMemo(() => {
    if (!citationStrings || citationStrings.length === 0) {
      return []
    }

    const parsed: ParsedCitation[] = []
    citationStrings.forEach((citationStr) => {
      const parsedCitation = parseCitationString(citationStr)
      if (parsedCitation) {
        parsed.push(parsedCitation)
      }
    })

    return parsed.sort((a, b) => a.startIndex - b.startIndex)
  }, [citationStrings])

  return parsedCitations
}