import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { toast } from "sonner";
import { Assessment_List_Filter } from "@/constants/urls";
import { Preferences } from "@capacitor/preferences";
import {assessmentTypes}  from '@/types/assessment'

const getStoredDetails = async () => {
  const studentData = await Preferences.get({ key: "StudentDetails" });
  const instituteData = await Preferences.get({ key: "InstituteDetails" });

  const student = studentData.value ? JSON.parse(studentData.value) : null;
  const institute = instituteData.value
    ? JSON.parse(instituteData.value)
    : null;

  return { student, institute };
};

export const fetchAssessmentData = async (
  pageNo: number,
  pageSize: number,
  assessmentType: assessmentTypes
) => {
  try {
    const { student, institute } = await getStoredDetails();
    if (!student || !institute) {
      toast.error("Missing student or institute details.");
      return;
    }

    const requestBody = {
      name: "",
      batch_ids: [student.package_session_id],
      user_ids: [student.user_id],
      tag_ids: [],
      get_live_assessments: assessmentType === assessmentTypes.LIVE,
      get_passed_assessments: assessmentType === assessmentTypes.PAST,
      get_upcoming_assessments: assessmentType === assessmentTypes.UPCOMING,
      institute_ids: [institute.id],
      sort_columns: {},
    };

    const response = await authenticatedAxiosInstance.post(
      `${Assessment_List_Filter}`,
      requestBody,
      {
        params: {
          pageNo: pageNo,
          pageSize: pageSize,
          instituteId: institute.id,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    // toast.error("Failed to fetch assessments.");
  } finally {
    // setLoading(false);
  }
};
