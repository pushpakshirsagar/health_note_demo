import { useCallback } from 'react'
import { useAppData } from '@/context/AppDataContext'
import type { Guideline } from '@/types/citation'
import { toast } from "sonner"

export const useDraftNote = () => {

  const {activeTab} = useAppData()

  const copyToClipboard = useCallback((criteria:Guideline[]) => {
    try {
      const content = getCriteriaContent(criteria);
      navigator.clipboard.writeText(content)
      toast.success("Content saved to clipboard")
    } catch (error) {
      toast.error('Error copying content to clipboard')
    }
  }, [])


  const getCriteriaContent = useCallback((criteria : Guideline[]) => {
    let content: string = "";
    criteria.forEach((guideline) => {
      content += `${guideline.guideline_number}. ${guideline.report}\n`
      if (guideline.citations && guideline.citations.length > 0) {
        content += `${guideline.citations.length}\n`
      }
      content += "\n"
    })
    return content
  }, [])

  const downloadAsText = useCallback((criteria:Guideline[],activeTab:string) => {
    let content = ""

    const tabTitle = activeTab === "met" ? "MET CRITERIA" : "ALL CRITERIA"
    
    content += `${tabTitle}\n`
    content += "-".repeat(50) + "\n\n"
    content += getCriteriaContent(criteria);
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${tabTitle.toLocaleLowerCase().replaceAll(' ', '-')}-note.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [activeTab])

  return { downloadAsText,copyToClipboard }
}

