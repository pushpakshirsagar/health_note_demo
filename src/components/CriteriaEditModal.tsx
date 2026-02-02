import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { XIcon, CopyIcon, DownloadIcon, EditIcon } from "lucide-react"
import { useDraftNote } from "@/hooks/useDraftNote"
import type { Guideline } from "@/types/citation"

interface CriteriaEditModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "edit" | "focus"
  criteria: any[]
  activeTab: string
  setIsEditModalOpen?: (isEditModalOpen: boolean) => void
  setIsFocusModalOpen?: (isFocusModalOpen: boolean) => void
}

export const CriteriaEditModal = ({
  isOpen,
  onClose,
  mode,
  criteria,
  setIsEditModalOpen,
  setIsFocusModalOpen,
}: CriteriaEditModalProps) => {
  const { downloadAsText, copyToClipboard } = useDraftNote()
  const [editedCriteria, setEditedCriteria] = useState<Guideline[]>([])

  useEffect(() => {
    if (isOpen && criteria) {
      const initial: Guideline[] = []
      criteria.forEach((guideline: any) => {
        initial.push(guideline)
      })
      setEditedCriteria(initial)
    }
  }, [isOpen, criteria])

  if (!isOpen) return null



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === "edit" ? "Edit Criteria" : "Focus Mode"}
          </h2>
          <div className="flex items-center gap-2">
            {mode === "edit" ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(editedCriteria)}>
                  <CopyIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => downloadAsText(editedCriteria)}>
                  <DownloadIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(editedCriteria)}>
                  <CopyIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => downloadAsText(editedCriteria)}>
                  <DownloadIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                    setIsEditModalOpen?.(true);
                    setIsFocusModalOpen?.(false)
                }}>
                  <EditIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <XIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {criteria.map((guideline: any) => (
              <div key={guideline.guideline_number} className="space-y-2">
                <Textarea
                  value={editedCriteria.find(g => g.guideline_number === guideline.guideline_number)?.report || guideline.report}
                  onChange={(e) => {
                    setEditedCriteria(prev => {
                      const index = prev.findIndex(g => g.guideline_number === guideline.guideline_number)
                      if (index !== -1) {
                        prev[index].report = e.target.value
                      }
                      return [...prev]
                    })
                  }}
                  className="min-h-24"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

