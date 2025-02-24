// import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
// import { StudentReportFilterInterface } from "./student-test-record";
// import { STUDENT_REPORT_DETAIL_URL, STUDENT_REPORT_URL } from "@/constants/urls";

// export const getStudentReport = async (
//     studentId: string | undefined,
//     instituteId: string | undefined,
//     pageNo: number,
//     pageSize: number,
//     selectedFilter: StudentReportFilterInterface,
// ) => {
//     const response = await authenticatedAxiosInstance({
//         method: "POST",
//         url: STUDENT_REPORT_URL,
//         params: {
//             studentId,
//             instituteId,
//             pageNo,
//             pageSize,
//         },
//         data: selectedFilter,
//     });
//     return response?.data;
// };

// export const viewStudentReport = async (
//     assessmentId: string,
//     attemptId: string,
//     instituteId: string | undefined,
// ) => {
//     const response = await authenticatedAxiosInstance({
//         method: "GET",
//         url: STUDENT_REPORT_DETAIL_URL,
//         params: {
//             assessmentId,
//             attemptId,
//             instituteId,
//         },
//     });
//     return response?.data;
// };

// export const handleStudentReportData = ({
//     studentId,
//     instituteId,
//     pageNo,
//     pageSize,
//     selectedFilter,
// }: {
//     studentId: string | undefined;
//     instituteId: string | undefined;
//     pageNo: number;
//     pageSize: number;
//     selectedFilter: StudentReportFilterInterface;
// }) => {
//     return {
//         queryKey: [
//             "GET_STUDENT_REPORT_DETAILS",
//             studentId,
//             instituteId,
//             pageNo,
//             pageSize,
//             selectedFilter,
//         ],
//         queryFn: () => getStudentReport(studentId, instituteId, pageNo, pageSize, selectedFilter),
//         staleTime: 60 * 60 * 1000,
//     };
// };
