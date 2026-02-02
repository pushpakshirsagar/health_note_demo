import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { XIcon, CopyIcon, DownloadIcon, EditIcon } from "lucide-react"
import { useDraftNote } from "@/hooks/useDraftNote"
import type { Guideline } from "@/types/citation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useAppData } from "@/context/AppDataContext"

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
  const { allCriteria, metCriteria } = useAppData()
  const [activeTab, setActiveTab] = useState("met")

  useEffect(() => {
    if (isOpen) {
      const currentCriteria = activeTab === "met" ? metCriteria : allCriteria
      const initial: Guideline[] = []
      currentCriteria.forEach((guideline: any) => {
        initial.push(guideline)
      })
      setEditedCriteria(initial)
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
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {editedCriteria.map((guideline: any) => (
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
        </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}


