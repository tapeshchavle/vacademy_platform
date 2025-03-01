
import { DocumentLoadEvent, PageChangeEvent, Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";

// Plugin imports
import { attachmentPlugin } from "@react-pdf-viewer/attachment";
import { bookmarkPlugin } from "@react-pdf-viewer/bookmark";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { dropPlugin } from "@react-pdf-viewer/drop";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import { getFilePlugin } from "@react-pdf-viewer/get-file";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { localeSwitcherPlugin } from "@react-pdf-viewer/locale-switcher";
import { openPlugin } from "@react-pdf-viewer/open";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { printPlugin } from "@react-pdf-viewer/print";
import { propertiesPlugin } from "@react-pdf-viewer/properties";
import { rotatePlugin } from "@react-pdf-viewer/rotate";
import { scrollModePlugin } from "@react-pdf-viewer/scroll-mode";
import { searchPlugin } from "@react-pdf-viewer/search";
import { selectionModePlugin } from "@react-pdf-viewer/selection-mode";
import { themePlugin } from "@react-pdf-viewer/theme";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

export const PdfViewerComponent = ({pdfUrl, handleDocumentLoad, handlePageChange}:{pdfUrl: string; handleDocumentLoad: (e: DocumentLoadEvent)=>void; handlePageChange: (e: PageChangeEvent)=>void}) => {
     // Plugin instances
        const attachmentPluginInstance = attachmentPlugin();
        const bookmarkPluginInstance = bookmarkPlugin();
        const defaultLayoutPluginInstance = defaultLayoutPlugin();
        const dropPluginInstance = dropPlugin();
        const fullScreenPluginInstance = fullScreenPlugin();
        const getFilePluginInstance = getFilePlugin();
        const highlightPluginInstance = highlightPlugin();
        const localeSwitcherPluginInstance = localeSwitcherPlugin();
        const openPluginInstance = openPlugin();
        const pageNavigationPluginInstance = pageNavigationPlugin();
        const printPluginInstance = printPlugin();
        const propertiesPluginInstance = propertiesPlugin();
        const rotatePluginInstance = rotatePlugin();
        const scrollModePluginInstance = scrollModePlugin();
        const searchPluginInstance = searchPlugin();
        const selectionModePluginInstance = selectionModePlugin();
        const themePluginInstance = themePlugin();
        const thumbnailPluginInstance = thumbnailPlugin();
        const toolbarPluginInstance = toolbarPlugin();
        const zoomPluginInstance = zoomPlugin();

    return(
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div className="h-full w-full">
            <Viewer
                fileUrl={pdfUrl}
                onDocumentLoad={handleDocumentLoad}
                onPageChange={handlePageChange}
                plugins={[
                    attachmentPluginInstance,
                    bookmarkPluginInstance,
                    defaultLayoutPluginInstance,
                    dropPluginInstance,
                    fullScreenPluginInstance,
                    getFilePluginInstance,
                    highlightPluginInstance,
                    localeSwitcherPluginInstance,
                    openPluginInstance,
                    pageNavigationPluginInstance,
                    printPluginInstance,
                    propertiesPluginInstance,
                    rotatePluginInstance,
                    scrollModePluginInstance,
                    searchPluginInstance,
                    selectionModePluginInstance,
                    themePluginInstance,
                    thumbnailPluginInstance,
                    toolbarPluginInstance,
                    zoomPluginInstance,
                ]}
            />
        </div>
    </Worker>
    )
}