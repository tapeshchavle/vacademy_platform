// hooks/use-slides.ts
import { useQuery } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
    GET_SLIDES,
} from "@/constants/urls";

export interface Slide {
    slide_title: string | null;
    document_id: string | null;
    document_title: string | null;
    document_type: string;
    slide_description: string | null;
    document_cover_file_id: string | null;
    video_description: string | null;
    document_data: string | null;
    video_id: string | null;
    video_title: string | null;
    video_url: string | null;
    slide_id: string;
    source_type: string;
    status: string;
}

export const useSlides = (chapterId: string) => {

    const getSlidesQuery = useQuery({
        queryKey: ["slides", chapterId],
        queryFn: async () => {
            const response = await authenticatedAxiosInstance.get(`${GET_SLIDES}/${chapterId}`);
            return response.data;
        },
        staleTime: 3600000,
    });
    

    return {
        slides: getSlidesQuery.data,
        isLoading: getSlidesQuery.isLoading,
        error: getSlidesQuery.error
    };
};
