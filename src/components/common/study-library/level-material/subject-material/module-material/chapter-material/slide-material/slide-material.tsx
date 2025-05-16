import { useEffect, useRef, useState } from "react";
import PDFViewer from "./pdf-viewer";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { EmptySlideMaterial } from "@/assets/svgs";
import { YouTubePlayerComp } from "./youtube-player";
import { convertHtmlToPdf } from "@/utils/html-to-pdf";
import { useFileUpload } from "@/hooks/use-file-upload";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { extractVideoId } from "@/utils/study-library/tracking/extractVideoId";

export const SlideMaterial = () => {
    const { activeItem } = useContentStore();
    const selectionRef = useRef(null);
    const loadGenerationRef = useRef(0);
    const [heading, setHeading] = useState(activeItem?.title || "");
    const [content, setContent] = useState<JSX.Element | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { uploadFile, getPublicUrl } = useFileUpload();

    const handleConvertAndUpload = async (htmlString: string | null): Promise<string | null> => {
        if (htmlString == null) return null;
        try {
            setIsUploading(true);
            setError(null);

            // Step 1: Convert HTML to PDF
            const pdfBlob = await convertHtmlToPdf(htmlString);

            // Step 2: Convert Blob to File
            const pdfFile = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });

            // Step 3: Upload the PDF file
            const uploadedFileId = await uploadFile({
                file: pdfFile,
                setIsUploading,
                userId: 'your-user-id',
                source: 'PDF',
                sourceId: "", // Optional
                publicUrl: true, // Set to true to get a public URL
            });

            if (uploadedFileId) {
                const publicUrl = await getPublicUrl(uploadedFileId);
                return publicUrl; // Return the public URL as a string
            }
        } catch (error) {
            console.error('Upload Failed:', error);
            setError('Failed to convert or upload document. Please try again.');
        } finally {
            setIsUploading(false);
        }
        return null; // Return null if the upload fails
    };

    const loadContent = async ( generationId: number) => {
        if (generationId !== loadGenerationRef.current) return;
        setError(null);
        
        if (!activeItem) {
            if (generationId !== loadGenerationRef.current) return;
            setContent(
                <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                    <EmptySlideMaterial />
                    <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                </div>,
            );
            return;
        }

        if (generationId !== loadGenerationRef.current) return;
        setContent(<DashboardLoader />);

        try {
            if (activeItem.source_type == "VIDEO") {
                if (generationId !== loadGenerationRef.current) return;
                setContent(
                    <div key={`video-${activeItem.id}`} className="h-full w-full">
                        <YouTubePlayerComp videoId={extractVideoId(activeItem.video_slide?.published_url || "") || ""} ms={activeItem.progress_marker} />
                    </div>,
                );
                return;
            }

            if (activeItem?.source_type == "DOCUMENT" && activeItem.document_slide?.type=="PDF") {
                const url = await getPublicUrl(activeItem?.document_slide?.published_data || "");
                if (generationId !== loadGenerationRef.current) return;
                if (!url) {
                    throw new Error("Failed to retrieve PDF URL");
                }
                setContent(<PDFViewer pdfUrl={url} />);
                return;
            }

            if (activeItem?.source_type == "DOCUMENT" && activeItem.document_slide?.type=="DOC") {
                const url = await handleConvertAndUpload(activeItem.document_slide?.published_data);
                if (generationId !== loadGenerationRef.current) return;
                if (url == null) {
                    throw new Error("Error generating PDF URL");
                }
                setContent(<PDFViewer pdfUrl={url} />);
                return;
            }
        } catch (err) {
            console.error("Error loading content:", err);
            if (generationId === loadGenerationRef.current) {
                setError(err instanceof Error ? err.message : "Failed to load content");
                setContent(
                    <div className="flex h-[300px] flex-col items-center justify-center">
                        <p className="text-red-500">{error || "An error occurred while loading content"}</p>
                    </div>
                );
            }
        }
    };

    useEffect(() => {
        loadGenerationRef.current += 1;
        const currentGeneration = loadGenerationRef.current;

        if (activeItem) {
            setHeading(activeItem.title || "");
            loadContent( currentGeneration);
        } else {
            setHeading("No content");
            if (currentGeneration === loadGenerationRef.current) {
                setContent(
                    <div className="flex h-[500px] flex-col items-center justify-center rounded-lg py-10">
                        <EmptySlideMaterial />
                        <p className="mt-4 text-neutral-500">No study material has been added yet</p>
                    </div>,
                );
            }
        }
    }, [activeItem]);


    return (
        <div className="flex w-full flex-col" ref={selectionRef}>
            <div className="-mx-8 -my-3 flex items-center justify-between gap-6 border-b border-neutral-300 px-8 py-2">
                <h3 className="text-subtitle font-semibold text-neutral-600">
                    {heading || "No content"}
                </h3>
            </div>
            <div
                className={`mx-auto mt-8 ${
                    activeItem?.source_type=="DOCUMENT" && activeItem?.document_slide?.type == "PDF" ? "h-[calc(100vh-200px)] w-[500px]" : "h-full"
                } w-full overflow-hidden`}
            >
                {content}
                {isUploading && <DashboardLoader />}
            </div>
        </div>
    );
};