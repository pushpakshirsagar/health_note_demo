import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Inspection from "./components/Inspection";
import DraftNote from "./components/DraftNote";
import { AppDataProvider } from "./context/AppDataContext";
import { Toaster } from "./components/ui/sonner";

export function TabsLine() {
  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export function App() {
// return <ComponentExample />;
return(
    <AppDataProvider>
    <div className="flex h-full w-full overflow-x-hidden">
        <div className="basis-1/2 h-[800px] m-auto min-w-0 ml-10 mr-4">
        <DraftNote />
        </div>
        <div className="basis-1/2 h-[800px] m-auto min-w-0 ml-4 mr-10">
        <Inspection />
        </div>
    </div>
    <Toaster />
    </AppDataProvider>
)
}

export default App;