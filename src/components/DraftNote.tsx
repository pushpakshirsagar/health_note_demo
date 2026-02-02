import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditIcon, DownloadIcon, CopyIcon, Maximize2, ArrowUpRight } from "lucide-react"
import { Button } from "./ui/button"
import dummyResponse from "@/data/dummyResponse.json"
import { useAppData } from "@/context/AppDataContext"
import type { ParsedCitation } from "@/types/citation"
import { useDraftNote } from "@/hooks/useDraftNote"
import { CriteriaEditModal } from "./CriteriaEditModal"
import { parseCitationString } from "@/lib/citationUtils"

const DraftNote = () => {
    const { setSelectedCitations, activeTab, setActiveTab, metCriteria, allCriteria } = useAppData()
    const { downloadAsText, copyToClipboard } = useDraftNote()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
    
    const currentCriteria = activeTab === "met" ? metCriteria : allCriteria

    const handleSourceClick = (citations: string[]) => {
        console.log('handleSourceClick', citations)
        if (citations && citations.length > 0) {
            const parsedCitationsResult: ParsedCitation[] = citations
                .map((citationStr) => parseCitationString(citationStr))
                .filter((citation): citation is ParsedCitation => citation !== null)
                .sort((a, b) => a.startIndex - b.startIndex)

            const noteText = dummyResponse.result_json.note
            setSelectedCitations(parsedCitationsResult, noteText)
        }
    }
   
    return (
        <div className="h-full flex flex-col border rounded-md overflow-hidden">
            <div className="text-2xl font-bold p-4 shrink-0"> Utilization Review Draft Note</div>
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="met" className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b min-w-0 shrink-0">
                    <TabsList variant="line">
                        <TabsTrigger value="met">Met Criteria</TabsTrigger>
                        <TabsTrigger value="criteria">All Criteria</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            onClick={() => downloadAsText(currentCriteria)}
                        >
                            <DownloadIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            onClick={() => copyToClipboard(currentCriteria)}
                        >
                            <CopyIcon className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            onClick={() => setIsFocusModalOpen(true)}
                        > 
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden min-h-0">
                    <TabsContent value="met" className="mt-0">
                        {metCriteria.length > 0 && (
                            metCriteria.map((guideline: any) => (
                                <div key={guideline.guideline_number} className="whitespace-pre-line mb-4">
                                    <div>{guideline.guideline_number}. {guideline.report}
                                        {guideline.citations && guideline.citations.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                className="hover:bg-muted h-6 bg-blue-100 rounded-md transition-colors text-xs ml-2"
                                                onClick={() => handleSourceClick(guideline.citations)}
                                            >
                                                Source <ArrowUpRight />
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            ))
                        )}
                    </TabsContent>
                    <TabsContent value="criteria" className="mt-0">
                        {allCriteria.length > 0 && (
                            allCriteria.map((guideline: any) => (
                                <div key={guideline.guideline_number} className="whitespace-pre-line mb-4">
                                    <div>{guideline.guideline_number}. {guideline.report}
                                        {guideline.citations && guideline.citations.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                className="hover:bg-muted h-6 bg-blue-100 rounded-md transition-colors text-xs ml-2"
                                                onClick={() => handleSourceClick(guideline.citations)}
                                            >
                                                Source <ArrowUpRight />
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            ))
                        )}
                    </TabsContent>
                </div>
            </Tabs>
            
            {/* open modal for edit */}
            <CriteriaEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                criteria={currentCriteria}
            />
            
            <CriteriaEditModal
                isOpen={isFocusModalOpen}
                onClose={() => setIsFocusModalOpen(false)}
                mode="focus"
                criteria={currentCriteria}
                setIsEditModalOpen={setIsEditModalOpen}
                setIsFocusModalOpen={setIsFocusModalOpen}

            />
        </div>
    )
}

export default DraftNote