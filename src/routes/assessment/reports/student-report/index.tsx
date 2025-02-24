import { Preferences } from "@capacitor/preferences";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import {
  handleGetStudentReport,
  viewStudentReport,
} from "../-components/reportMain";
import { useEffect, useState } from "react";
import { TestReportDialog } from "@/components/common/student-test-records/test-report-dialog";

const studentReportParamsSchema = z.object({
  assessmentId: z.string(),
  attemptId: z.string(),
});
export const Route = createFileRoute("/assessment/reports/student-report/")({
  validateSearch: studentReportParamsSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const route = useRouter();
  const { report } = route.state;
  console.log("report", report);
  const { assessmentId, attemptId } = Route.useSearch();
  const [studentReportData, setStudentReportData] = useState(null);
  console.log(studentReportData);
  useEffect(() => {
    const fetchData = async () => {
      const { value: instituteId } = await Preferences.get({
        key: "institute_id",
      });

      if (instituteId) {
        const data = await viewStudentReport(
          assessmentId,
          attemptId,
          instituteId
        );
        setStudentReportData(data);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      <TestReportDialog
        studentReport={report}
        testReport={studentReportData}
        examType={"EXAM"}
      />
    </>
  );
}
