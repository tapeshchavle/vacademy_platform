import { SubjectDefaultImage } from "@/assets/svgs";
import { getPublicUrl } from "@/services/upload_file";
import { CourseType } from "@/stores/study-library/use-study-library-store";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";


interface CourseCardProps {
    course: CourseType;
}

export const CourseCard = ({ course }: CourseCardProps) => {
    
    const router = useRouter();
    const currentPath = router.state.location.pathname;
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const handleCourseCardClick = (e: React.MouseEvent) => {
        if (
            e.target instanceof Element &&
            (e.target.closest(".menu-options-container") ||
                e.target.closest(".drag-handle-container") ||
                e.target.closest('[role="menu"]') ||
                e.target.closest('[role="dialog"]'))
        ) {
            return;
        }

        navigate({
            to: `${currentPath}/levels`,
            search: {
                courseId: course.id,
            },
        });
    };

    useEffect(() => {
        const fetchImageUrl = async () => {
            if (course?.thumbnail_file_id) {
                try {
                    const url = await getPublicUrl(course?.thumbnail_file_id);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Failed to fetch image URL:", error);
                }
            }
        };

        fetchImageUrl();
    }, [course?.thumbnail_file_id]);

    return(
        <div onClick={handleCourseCardClick} className="cursor-pointer w-full ">
            <div
                className={`relative flex flex-col items-center justify-center gap-4 border rounded-lg border-neutral-200 bg-neutral-50 p-4  w-full`}
            >
                 {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={course.package_name}
                />
            ) : (
                <SubjectDefaultImage />
            )}
                <div className="flex items-center justify-between gap-5">
                    <div className="text-body font-semibold">{course.package_name}</div>
                </div>
            </div>
        </div>
    )
}