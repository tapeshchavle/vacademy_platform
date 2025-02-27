import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Preferences } from "@capacitor/preferences";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { STUDENT_REPORT_DETAIL_URL, STUDENT_REPORT_URL } from "@/constants/urls";
import { MyButton } from "@/components/design-system/button";
import { StatusChip } from "@/components/design-system/chips";
import { useNavigate } from "@tanstack/react-router";

export const viewStudentReport = async (
  assessmentId: string,
  attemptId: string,
  instituteId: string | null
) => {
  const response = await authenticatedAxiosInstance({
    method: "GET",
    url: STUDENT_REPORT_DETAIL_URL,
    params: {
      assessmentId,
      attemptId,
      instituteId,
    },
  });
  return response?.data;
};

export const handleGetStudentReport = ({
  assessmentId,
  attemptId,
  instituteId,
}: {
  assessmentId: string;
  attemptId: string;
  instituteId: string | null;
}) => {
  return {
    queryKey: ["GET_STUDENT_REPORT", assessmentId, attemptId, instituteId],
    queryFn: () => viewStudentReport(assessmentId, attemptId, instituteId),
    staleTime: 60 * 60 * 1000,
  };
};

const AssessmentReportList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNo, setPageNo] = useState(0);
  const [error, setError] = useState(null);
  const pageSize = 10;
  const observer = useRef();

  // const lastReportElementRef = useCallback(
  //   (node) => {
  //     if (loading) return;
  //     if (observer.current) observer.current.disconnect();

  //     observer.current = new IntersectionObserver((entries) => {
  //       if (entries[0].isIntersecting && hasMore) {
  //         setPageNo((prevPageNo) => prevPageNo + 1);
  //       }
  //     });

  //     if (node) observer.current.observe(node);
  //   },
  //   [loading, hasMore]
  // );

  // const getStudentReport = async (
  //   studentId: string | undefined,
  //   instituteId: string | undefined,
  //   pageNo: number,
  //   pageSize: number,
  //   selectedFilter: StudentReportFilterInterface
  // ) => {
  //   const response = await authenticatedAxiosInstance({
  //     method: "POST",
  //     url: STUDENT_REPORT_URL,
  //     params: {
  //       studentId,
  //       instituteId,
  //       pageNo,
  //       pageSize,
  //     },
  //     data: selectedFilter,
  //   });
  //   return response?.data;
  // };

  const handleViewReport = (report: any) => {
    navigate({
      to: `/assessment/reports/student-report`,
      search: {
        assessmentId: report.assessment_id,
        attemptId: report.attempt_id,
      },
      state: { report },
    });
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get details from Preferences
      const StudentDetails = await Preferences.get({ key: "StudentDetails" });
      const InstituteDetails = await Preferences.get({
        key: "InstituteDetails",
      });

      // Parse the JSON strings from Preferences
      const studentData = JSON.parse(StudentDetails.value);
      const instituteData = JSON.parse(InstituteDetails.value);

      const response = await authenticatedAxiosInstance.post(
        STUDENT_REPORT_URL,
        {
          name: "",
          status: ["ENDED"],
          sort_columns: {},
        },
        {
          params: {
            studentId: studentData.user_id,
            instituteId: instituteData.id,
            pageNo,
            pageSize,
          },
        }
      );

      const newReports = response.data.content;
      setReports((prev) =>
        pageNo === 0 ? newReports : [...prev, ...newReports]
      );
      setHasMore(!response.data.last);
    } catch (error) {
      console.error("Error fetching reports:", error);
      //   setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pageNo]);

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "text-green-500";
      case "offline":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  if (error) {
    return (
      <div className="text-center py-4 text-primary-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full  space-y-4 p-4">
      {reports.map((report) => (
        <Card
          key={report.attempt_id}
          className="w-full p-6 space-y-6"
          //   onClick={() => handleReportClick(report)}
        >
          <h2 className="text-sm lg:text-base font-semibold text-gray-900">
            {report.assessment_name}
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex gap-3 pb-3 items-center">
                <StatusChip
                  status={report.assessment_status}
                  className={getStatusColor(report.assessment_status)}
                />
              </div>
              <div className="space-y-2 text-xs lg:text-sm text-gray-600">
                <div>Attempt Date: {formatDateTime(report.attempt_date)}</div>
                <div>Subject: {report.subject}</div>
                <div>
                  Duration: {Math.floor(report.duration_in_seconds / 60)}{" "}
                  minutes
                </div>
                <div>Marks: {report.total_marks}</div>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <MyButton
                buttonType="secondary"
                className="w-full max-w-xs md:w-[200px] lg:w-[300px]"
                onClick={() => handleViewReport(report)}
              >
                View Report
              </MyButton>
            </div>
          </div>
        </Card>
      ))}

      {/* {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin h-6 w-6 text-primary-500" />
        </div>
      )} */}

      {!hasMore && reports.length > 0 && (
        <p className="text-center text-sm text-gray-500 py-4">
          No more reports to load
        </p>
      )}

      {reports.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No reports found</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentReportList;
