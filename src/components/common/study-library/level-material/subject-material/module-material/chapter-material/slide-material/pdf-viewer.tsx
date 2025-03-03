import React, { useEffect, useRef, useState } from "react";
import { DocumentLoadEvent, PageChangeEvent } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { v4 as uuidv4 } from 'uuid';
import { useTrackingStore } from "@/stores/study-library/pdf-tracking-store";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { getISTTime } from "./utils";
import { usePDFSync } from "@/hooks/study-library/usePdfSync";
import { getEpochTimeInMillis } from "./utils";
import { PdfViewerComponent } from "./pdf-viewer-component";

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
            source: 'PDF',
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
    
    }, [elapsedTime, documentId]);

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
       <PdfViewerComponent pdfUrl={pdfUrl} handlePageChange={handlePageChange} handleDocumentLoad={handleDocumentLoad} />
    );
};

export default PDFViewer;