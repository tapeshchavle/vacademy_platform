import { EmptySubjectMaterial } from "@/assets/svgs";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { SubjectCard } from "./subject-card";
import { useSidebar } from "@/components/ui/sidebar";
import { useStudyLibraryStore } from "@/stores/study-library/use-study-library-store";
import { PullToRefreshWrapper } from "@/components/design-system/pull-to-refresh";
import { fetchStudyLibraryDetails } from "@/services/study-library/getStudyLibraryDetails";
import { getPackageSessionId } from "@/utils/study-library/get-list-from-stores/getPackageSessionId";

export const SubjectMaterial = () => {
  const { setNavHeading } = useNavHeadingStore();
  const { open } = useSidebar();
  const { studyLibraryData, setStudyLibraryData } = useStudyLibraryStore();

  useEffect(() => {
    setNavHeading(
      <div className="flex items-center gap-2">
        <div>Subjects</div>
      </div>
    );
  }, []);

  const refreshData = async () => {
    const PackageSessionId = await getPackageSessionId();
    const data = await fetchStudyLibraryDetails(PackageSessionId);
    setStudyLibraryData(data);
  };

  return (
    <PullToRefreshWrapper onRefresh={refreshData}>
      <div className="w-full flex flex-col items-center justify-center">
        {!studyLibraryData?.length ? (
          <div className="flex w-full h-[70vh] flex-col items-center justify-center gap-8 rounded-lg">
            <EmptySubjectMaterial />
            <div>No subjects have been added yet.</div>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 ${open ? "sm:grid-cols-2 md-tablets:grid-cols-3" : "sm:grid-cols-3 md-tablets:grid-cols-4"} w-full gap-4`}
          >
            {studyLibraryData.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </PullToRefreshWrapper>
  );
};
