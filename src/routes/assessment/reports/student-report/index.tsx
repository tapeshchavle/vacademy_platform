// import { Preferences } from "@capacitor/preferences";
// import { createFileRoute, useRouter } from "@tanstack/react-router";
// import { z } from "zod";
// import { viewStudentReport } from "../-components/reportMain";
// import { useEffect, useState } from "react";
// import { TestReportDialog } from "@/components/common/student-test-records/test-report-dialog";

// const studentReportParamsSchema = z.object({
//   assessmentId: z.string(),
//   attemptId: z.string(),
// });
// export const Route = createFileRoute("/assessment/reports/student-report/")({
//   validateSearch: studentReportParamsSchema,
//   component: RouteComponent,
// });

// function RouteComponent() {
//   const route = useRouter();
//   const report = route;
//   console.log("Route:", route);
//   const { assessmentId, attemptId } = route.__store.state.matches[0].search;
//   const [studentReportData, setStudentReportData] = useState(null);
//   useEffect(() => {
//     const fetchData = async () => {
//       const { value: InstituteDetails } = await Preferences.get({
//         key: "InstituteDetails",
//       });
//       const instituteId = JSON.parse(InstituteDetails)?.id;
//       console.log("Institute ID:", instituteId);

//       if (instituteId) {
//         console.log("Fetching student report data...");
//         const data = await viewStudentReport(
//           assessmentId,
//           attemptId,
//           instituteId
//         );
//         setStudentReportData(data);
//       }
//     };

//     fetchData();
//   }, []);
//   return (
//     <>
//       <TestReportDialog
//         testReport={studentReportData}
//         studentReport={report}
//         examType={"EXAM"}
//       />
//     </>
//   );
// }

import { Preferences } from "@capacitor/preferences";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { viewStudentReport } from "../-components/reportMain";
import { useEffect, useState } from "react";
import { TestReportDialog } from "@/components/common/student-test-records/test-report-dialog";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { GET_ASSESSMENT_DETAILS } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { DashboardLoader } from "@/components/core/dashboard-loader";

const studentReportParamsSchema = z.object({
  assessmentId: z.string(),
  attemptId: z.string(),
});

export const Route = createFileRoute("/assessment/reports/student-report/")({
  validateSearch: studentReportParamsSchema,
  component: RouteComponent,
});
export const getAssessmentDetailsData = async ({
  assessmentId,
  instituteId,
  type,
}: {
  assessmentId: string | null | undefined;
  instituteId: string | undefined;
  type: string | undefined;
}): Promise<Steps> => {
  const response = await authenticatedAxiosInstance({
    method: "GET",
    url: GET_ASSESSMENT_DETAILS,
    params: {
      assessmentId,
      instituteId,
      type,
    },
  });
  return response?.data as Steps;
};
export const getAssessmentDetails = ({
  assessmentId,
  instituteId,
  type,
}: {
  assessmentId: string | null | undefined;
  instituteId: string | undefined;
  type: string | undefined;
}) => {
  return {
    queryKey: ["GET_ASSESSMENT_DETAILS", assessmentId, instituteId, type],
    queryFn: () =>
      getAssessmentDetailsData({ assessmentId, instituteId, type }),
    staleTime: 60 * 60 * 1000,
    enabled: !!assessmentId,
  };
};

function RouteComponent() {
  const route = useRouter();
  const { assessmentId, attemptId } = route.__store.state.matches[0].search;

  const [studentReportData, setStudentReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { value: InstituteDetails } = await Preferences.get({
          key: "InstituteDetails",
        });

        const instituteId = JSON.parse(InstituteDetails)?.id;
        console.log("Institute ID:", instituteId);

        if (instituteId) {
          console.log("Fetching student report data...");
          const data = await viewStudentReport(
            assessmentId,
            attemptId,
            instituteId
          );
          setStudentReportData(data);
        }
      } catch (error) {
        console.error("Error fetching student report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  //     </div>
  //   );
  // }

    

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="flex justify-center">
            <DashboardLoader />
          </div>
        </div>
      );
    }

  return (
    <>
      <LayoutContainer>
        <TestReportDialog
          testReport={studentReportData}
          studentReport={route}
          examType={"EXAM"}
        />
      </LayoutContainer>
    </>
  );
}
