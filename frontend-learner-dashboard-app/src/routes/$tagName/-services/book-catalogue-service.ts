import axios from "axios";
import { urlCourseDetails } from "@/constants/urls";

export interface BookCataloguePageParams {
    instituteId: string;
    levelIds: string[];
    searchByName: string;
    tags: string[];
    page: number;
    size: number;
}

export interface BookCatalogueItem {
    id: string;
    package_name?: string;
    package_type?: string;
    level_id?: string;
    level_name?: string;
    package_session_id?: string;
    enroll_invite_id?: string;
    course_banner_media_id?: string;
    course_preview_image_media_id?: string;
    course_html_description_html?: string;
    comma_separeted_tags?: string;
    min_plan_actual_price?: number;
    instructors?: Array<{ full_name?: string }>;
    available_slots?: number;
    availableSlots?: number;
    max_seats?: number;
    rating?: number;
    estimated_duration?: string;
    [key: string]: any;
}

export interface BookCataloguePage {
    content: BookCatalogueItem[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

export const fetchBookCataloguePage = async (
    params: BookCataloguePageParams
): Promise<BookCataloguePage> => {
    const { instituteId, levelIds, searchByName, tags, page, size } = params;

    const response = await axios.post<BookCataloguePage>(
        urlCourseDetails,
        {
            status: [],
            level_ids: levelIds,
            faculty_ids: [],
            search_by_name: searchByName,
            tag: tags,
            package_types: ["COURSE"],
            min_percentage_completed: 0,
            max_percentage_completed: 0,
        },
        {
            params: {
                instituteId,
                page,
                size,
                sort: "createdAt,desc",
            },
            headers: { "Content-Type": "application/json" },
        }
    );

    return response.data;
};
