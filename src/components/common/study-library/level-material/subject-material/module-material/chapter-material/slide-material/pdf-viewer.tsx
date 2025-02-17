import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { DocumentLoadEvent, PageChangeEvent } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
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
import { usePDFSync } from "@/hooks/study-library/usePdfSync";
import { getEpochTimeInMillis } from "./utils";

interface PDFViewerProps {
   documentId?: string;
   pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documentId, pdfUrl }) => {
    const { addActivity } = useTrackingStore();
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageStartTime = useRef<Date>(new Date());
    const activityId = useRef(uuidv4());
    const startTime = useRef(getISTTime());
    const pageViews = useRef<Array<{
         id: string,
        page: number,
        duration: number,
        start_time: string,
        end_time: string,
        start_time_in_millis: number,
        end_time_in_millis: number
    }>>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const totalPagesReadRef = useRef<number>(0);
    const startTimeInMillis = useRef(getEpochTimeInMillis());
    const { syncPDFTrackingData } = usePDFSync();
    const [isFirstView, setIsFirstView] = useState(true);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);


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
    
        addActivity({
            activity_id: activityId.current,
            source: 'pdf',
            source_id: documentId || '',
            start_time: startTime.current,
            end_time: getISTTime(),
            start_time_in_millis: startTimeInMillis.current,
            end_time_in_millis: getEpochTimeInMillis(),
            duration: elapsedTime.toString(),
            page_views: pageViews.current,
            total_pages_read: totalPagesReadRef.current,
            sync_status: 'STALE',
            current_page: currentPage,
            current_page_start_time_in_millis: pageStartTime.current.getTime(),
            new_activity: true
        }, true);
    
    }, [elapsedTime, documentId, totalPages, addActivity]);

    const handleDocumentLoad = (e: DocumentLoadEvent) => {
        setTotalPages(e.doc.numPages);
        const now = getEpochTimeInMillis();
        pageStartTime.current = new Date();
        startTimeInMillis.current = now;
        
        if (isFirstView) {
            console.log("integrate add document activity api now");
            syncPDFTrackingData();
            setIsFirstView(false);
            
            // Start the 2-minute interval for update notifications
            if (!updateIntervalRef.current) {
                updateIntervalRef.current = setInterval(() => {
                    console.log("integrate update document activity api now");
                    syncPDFTrackingData();
                }, 2 * 60 * 1000); // 2 minutes in milliseconds
            }
        }
    };

    const handlePageChange = (e: PageChangeEvent) => {
        const now = getEpochTimeInMillis();
        const duration = Math.round((now - pageStartTime.current.getTime()) / 1000);

        if (duration >= 10) {
            pageViews.current.push({
                id: uuidv4(),
                page: currentPage,
                duration,
                start_time: new Date(pageStartTime.current).toISOString(),
                end_time: new Date(now).toISOString(),
                start_time_in_millis: pageStartTime.current.getTime(),
                end_time_in_millis: now
            });
        }

        setCurrentPage(e.currentPage);
        pageStartTime.current = new Date();
    };

    useEffect(() => {
        startTimer();
        return () => {
            stopTimer();
            if (updateIntervalRef.current) {
                clearInterval(updateIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        totalPagesReadRef.current = new Set(pageViews.current.map(v => v.page)).size;

        addActivity({
            activity_id: activityId.current,
            source: 'DOCUMENT',
            source_id: documentId || '',
            start_time: startTime.current,
            end_time: getISTTime(),
            start_time_in_millis: startTimeInMillis.current,
            end_time_in_millis: getEpochTimeInMillis(),
            duration: elapsedTime.toString(),
            page_views: pageViews.current,
            total_pages_read: totalPagesReadRef.current,
            sync_status: 'STALE',
            current_page: currentPage,
            current_page_start_time_in_millis: pageStartTime.current.getTime(),
            new_activity: true
        }, true);

    }, [elapsedTime, documentId, totalPages]);

    return (
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
    );
};

export default PDFViewer;