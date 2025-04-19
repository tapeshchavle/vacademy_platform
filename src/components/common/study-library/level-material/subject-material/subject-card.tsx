import { SubjectDefaultImage } from "@/assets/svgs";
import { useFileUpload } from "@/hooks/use-file-upload";
import { SubjectType } from "@/stores/study-library/use-study-library-store";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface SubjectCardProps {
  subject: SubjectType;
}

export const SubjectCard = ({ subject }: SubjectCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const { getPublicUrl } = useFileUpload();
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof Element &&
      (e.target.closest(".menu-options-container") ||
        e.target.closest(".drag-handle-container") ||
        e.target.closest('[role="menu"]') ||
        e.target.closest('[role="dialog"]'))
    ) {
      return;
    }

    const currentPath = router.state.location.pathname;
    router.navigate({
      to: `${currentPath}/modules`,
      search: {
        subjectId: subject.id,
      },
    });
  };

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (subject.thumbnail_id) {
        try {
          const url = await getPublicUrl(subject.thumbnail_id);
          setImageUrl(url);
        } catch (error) {
          console.error("Failed to fetch image URL:", error);
        }
      }
    };

    fetchImageUrl();
  }, [subject.thumbnail_id]);

  return (
    <div onClick={handleCardClick} className="cursor-pointer w-full h-[300px]">
      <div
        className={`h-full relative flex flex-col items-center justify-center gap-4 border rounded-lg border-neutral-200 bg-neutral-50 p-4  w-full`}
      >
        <div className="h-[85%]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={subject.subject_name}
              className="size-full rounded-lg object-cover "
            />
          ) : (
            <SubjectDefaultImage />
          )}
        </div>
        <div className="flex items-center justify-between gap-5">
          <div className="text-body font-semibold">{subject.subject_name}</div>
        </div>
      </div>
    </div>
  );
};
