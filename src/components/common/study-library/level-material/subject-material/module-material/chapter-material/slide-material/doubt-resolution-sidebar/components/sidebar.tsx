import { MyButton } from "@/components/design-system/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { ArrowUp, X } from "@phosphor-icons/react"
import {  Dispatch, SetStateAction, useState } from "react";
import { doubtListDummy } from "../dummy-data/doubt-list";
import { Doubt } from "./doubt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";

export const DoubtResolutionSidebar = ({setDoubtProgressMarkerPdf, setDoubtProgressMarkerVideo}:{setDoubtProgressMarkerPdf:Dispatch<SetStateAction<number | null>>, setDoubtProgressMarkerVideo:Dispatch<SetStateAction<number | null>>}) => {
    const {open, setOpen} = useSidebar();
    const [showInput, setShowInput] = useState<boolean>(false)
    const [doubt, setDoubt] = useState<string>("")

   return(
    // <SidebarProvider >
      <Sidebar side="right" className={`${open? "w-[50vw]" : "w-0"} bg-white p-4 flex flex-col gap-6 overflow-y-hidden`} >
        <SidebarHeader className="flex items-center justify-between w-full bg-white overflow-y-hidden">
            <div className="flex items-center justify-between bg-white w-full">
                <h1 className="sm:text-2xl text-lg font-semibold text-primary-500">Doubt Resolution</h1>
                <X className="hover:cursor-pointer" onClick={()=>setOpen(false)} />
            </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-4 overflow-y-scroll no-scrollbar bg-white pt-6">
            <Tabs defaultValue="All ">
                <TabsList className="w-full flex border-b border-neutral-300 p-0 bg-white rounded-none">
                    <TabsTrigger value="All" className="w-full data-[state=active]:shadow-none rounded-none rounded-tl-md rounded-tr-md border-white border-l-[1px] border-r-[1px] border-t-[1px] data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 pt-2">All</TabsTrigger>
                    <TabsTrigger value="Resolved" className="w-full data-[state=active]:shadow-none rounded-none rounded-tl-md rounded-tr-md border-white border-l-[1px] border-r-[1px] border-t-[1px] data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 pt-2">Resolved</TabsTrigger>
                    <TabsTrigger value="Unresolved" className="w-full data-[state=active]:shadow-none rounded-none rounded-tl-md rounded-tr-md border-white border-l-[1px] border-r-[1px] border-t-[1px] data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 pt-2">Unresolved</TabsTrigger>
                </TabsList>
                <TabsContent value="All">
                    {doubtListDummy.map((doubt, key) => (
                        <Doubt doubt={doubt} key={key} setDoubtProgressMarkerPdf={setDoubtProgressMarkerPdf} setDoubtProgressMarkerVideo={setDoubtProgressMarkerVideo} />
                    ))}
            </TabsContent>
            </Tabs>
        </SidebarContent>
        <SidebarFooter className="w-full flex items-center justify-center bg-white sm:py-0">
            {showInput ? (
                <div className=" items-center rounded-md p-3 w-full flex gap-2">
                    <MainViewQuillEditor
                        value={doubt}
                        onChange={setDoubt}
                        className="w-full sm:mb-10 mb-16 h-[80px] max-sm:h-[50px]"
                    />
                    <div className="flex flex-col items-center gap-3">
                        <MyButton layoutVariant="icon">
                            <ArrowUp />
                        </MyButton>
                        <MyButton layoutVariant="icon" buttonType="secondary" onClick={()=>setShowInput(false)}>
                            <X />
                        </MyButton>
                    </div>
                </div>
            ):
            <MyButton scale="large" onClick={()=>setShowInput(true)}>Ask Doubt</MyButton>
            }
        </SidebarFooter>
      </Sidebar>
    // </SidebarProvider>
   )
}