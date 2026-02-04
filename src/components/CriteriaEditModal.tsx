import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { XIcon, CopyIcon, DownloadIcon, EditIcon } from "lucide-react"
import { useDraftNote } from "@/hooks/useDraftNote"
import type { Guideline } from "@/types/citation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useAppData } from "@/context/AppDataContext"

function combinedTextFromCriteria(criteria: Guideline[]): string {
  return criteria.map((g) => `${g.guideline_number}. ${g.report}`).join("\n\n")
}

function parseCombinedToCriteria(combinedText: string, template: Guideline[]): Guideline[] {
  if (!template.length) return []
  // Split only when a new line starts with "number. " (double newline + number)
  const parts = combinedText.split(/\n\n(?=\d+\. )/).map((s) => s.trim()).filter(Boolean)
  return template.map((guideline) => {
    const num = String(guideline.guideline_number)
    const part = parts.find((p) => p.startsWith(`${num}. `))
    const report = part ? part.slice(num.length + 2).trim() : guideline.report
    return { ...guideline, report }
  })
}

interface CriteriaEditModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "edit" | "focus"
  criteria?: any[]
  setIsEditModalOpen?: (isEditModalOpen: boolean) => void
  setIsFocusModalOpen?: (isFocusModalOpen: boolean) => void
}

export const CriteriaEditModal = ({
  isOpen,
  onClose,
  mode,
  setIsEditModalOpen,
  setIsFocusModalOpen,
}: CriteriaEditModalProps) => {
  const { downloadAsText, copyToClipboard } = useDraftNote()
  const [editedCriteria, setEditedCriteria] = useState<Guideline[]>([])
  const [combinedText, setCombinedText] = useState("")
  const { allCriteria, metCriteria } = useAppData()
  const [activeTab, setActiveTab] = useState("met")

  const currentCriteria = activeTab === "met" ? metCriteria : allCriteria

  useEffect(() => {
    if (isOpen && currentCriteria.length > 0) {
      const initial = currentCriteria.map((g: Guideline) => ({ ...g }))
      setEditedCriteria(initial)
      setCombinedText(combinedTextFromCriteria(initial))
    }
  }, [isOpen, activeTab])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-4xl max-h-140 bg-background rounded-lg shadow-lg flex flex-col">
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Criteria" : "Focus on Criteria"}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(editedCriteria)}>
              <CopyIcon className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => downloadAsText(editedCriteria,activeTab)}>
              <DownloadIcon className="w-4 h-4" />
            </Button>
            {mode !== "edit" && (
              <>
                <Button variant="ghost" size="icon" onClick={() => {
                  setIsEditModalOpen?.(true);
                  setIsFocusModalOpen?.(false)
                }}>
                  <EditIcon className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Header */}
        <div className="border-b min-w-0 shrink-0">
          <TabsList variant="line">
            <TabsTrigger value="met">Met Criteria</TabsTrigger>
            <TabsTrigger value="criteria">All Criteria</TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <TabsContent value={activeTab} className="mt-0 flex-1 overflow-y-auto p-4">
          <div className="max-h-[calc(100vh-200px)]">
            <Textarea
              value={combinedText}
              disabled={mode === "focus"}
              onChange={(e) => {
                const next = e.target.value
                setCombinedText(next)
                setEditedCriteria(parseCombinedToCriteria(next, editedCriteria))
              }}
              className="min-h-[calc(100vh-280px)] disabled:opacity-100 w-full resize-y border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm whitespace-pre-wrap"
            />
          </div>
        </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}


