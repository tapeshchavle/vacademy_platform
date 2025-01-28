import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { DocumentLoadEvent, PageChangeEvent } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { usePDFStore } from "@/types/study-library/pdf-store";
import { v4 as uuidv4 } from 'uuid';

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
import { useTrackingStore } from "@/stores/study-library/pdf-tracking-store";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { getISTTime } from "./utils";

interface PDFViewerProps {
   documentId?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documentId }) => {
    const { pdfUrl } = usePDFStore();
    const { addActivity } = useTrackingStore();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageStartTime = useRef<Date>(new Date());
    const activityId = useRef(uuidv4());
    const startTime = useRef(getISTTime());
    const pageViews = useRef<Array<{
        page: number, 
        duration: number
    }>>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const totalPagesReadRef = useRef<number>(0);

    const defaultPdfUrl = "https://vacademy-media-storage.s3.ap-south-1.amazonaws.com/c70f40a5-e4d3-4b6c-a498-e612d0d4b133/PDF_DOCUMENTS/6a99e32c-9895-42fc-9e70-7afa237498d2-project_report.docx.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250128T085555Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=AKIA3ISBV4TNOKWJM7FQ%2F20250128%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=f43a50ae25b066b4a6226f4393df1f9cb9165ce8859b71b2069429173517aac7";

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

    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Start timer when component mounts
    useEffect(() => {
        startTimer();
        return () => {
            stopTimer();
        };
    }, []);

    // Update activity in real-time when elapsedTime changes
    useEffect(() => {
        totalPagesReadRef.current = new Set(pageViews.current.map(v => v.page)).size;
        console.log("total_pages_read: ", totalPagesReadRef.current)

        addActivity({
            activity_id: activityId.current,
            source: 'pdf',
            source_id: documentId || '',
            start_time: startTime.current,
            end_time: getISTTime(),
            duration: elapsedTime.toString(),
            page_views: pageViews.current,
            total_pages_read: totalPagesReadRef.current,
            sync_status: 'STALE'
        }, true);

    }, [elapsedTime, documentId, totalPages, addActivity]);

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        setTotalPages(e.doc.numPages);
        pageStartTime.current = new Date();
        console.log("PDF loaded!", {
            numberOfPages: e.doc.numPages,
            documentId: documentId,
            timeOpened: new Date().toISOString(),
        });
    };

    const handlePageChange = (e: PageChangeEvent) => {
        const now = new Date();
        const duration = Math.round((now.getTime() - pageStartTime.current.getTime()) / 1000);

        if (duration >= 10) {
            pageViews.current.push({
                page: currentPage,
                duration
            });
        }

        setCurrentPage(e.currentPage);
        pageStartTime.current = now;
    };

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="h-full w-full">
                <Viewer
                    fileUrl={pdfUrl || defaultPdfUrl}
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
    );
};

export default PDFViewer;