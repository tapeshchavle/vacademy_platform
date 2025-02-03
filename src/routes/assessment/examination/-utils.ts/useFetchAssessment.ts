import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { toast } from "sonner";
import {
  Assessment_List_Filter,
  ASSESSMENT_PREVIEW,
  START_ASSESSMENT,
} from "@/constants/urls";
import { Preferences } from "@capacitor/preferences";
import {
  assessmentTypes,
  AssessmentPreviewData,
//   Section_dto,
//   Question_dto,
  Section,
} from "@/types/assessment";
import { Storage } from "@capacitor/storage";

const getStoredDetails = async () => {
  const studentData = await Preferences.get({ key: "StudentDetails" });
  const instituteData = await Preferences.get({ key: "InstituteDetails" });

  const student = studentData.value ? JSON.parse(studentData.value) : null;
  const institute = instituteData.value
    ? JSON.parse(instituteData.value)
    : null;

  return { student, institute };
};

const getStartAssessmentDetails = async () => {
  const InstructionID_and_AboutID = await Preferences.get({
    key: "InstructionID_and_AboutID",
  });
  const assessment_questions = await Preferences.get({
    key: "Assessment_questions",
  });

  const assessment = InstructionID_and_AboutID.value
    ? JSON.parse(InstructionID_and_AboutID.value)
    : null;
  const questions = assessment_questions.value
    ? JSON.parse(assessment_questions.value)
    : null;

  return {
    assessment_id: assessment.assessment_id,
    user_id: questions.assessment_user_registration_id,
    attempt_id: questions.attempt_id,
  };
};

const transformData = (data: AssessmentPreviewData) => {
    const sectionMap: Section[] = [];

    // Initialize sections
    data.section_dtos.forEach((section) => {
      sectionMap.push({...section , questions : []});
    });

    // Group questions by section_id
    data.question_preview_dto_list.forEach((question) => {
      const section = sectionMap.find((sec) => sec.id === question.section_id);
      if (section) {
        section.questions.push(question);
      }
    });

    return {
      preview_total_time: data.preview_total_time,
      sections: Object.values(sectionMap),
      attempt_id: data.attempt_id,
      assessment_user_registration_id: data.assessment_user_registration_id,
    };
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

export const fetchPreviewData = async (assessment_id: string) => {
  try {
    const { student, institute } = await getStoredDetails();
    if (!student || !institute) {
      toast.error("Missing student or institute details.");
      return;
    }
    const getStudentDetails = async () => {
      const storedData = await Storage.get({ key: "StudentDetails" });

      if (storedData.value) {
        try {
          const parsedData = await JSON.parse(storedData.value);
          console.log(parsedData);
          console.log(parsedData.package_session_id);
          return parsedData;
        } catch (error) {
          return "";
        }
      }
    };
    const getInstituteId = async () => {
      const institute_id_value = await Storage.get({ key: "InstituteId" });

      if (institute_id_value.value) {
        return institute_id_value.value;
      }
    };

    const institute_id = await getInstituteId();
    console.log(institute_id);
    const student_details = await getStudentDetails();
    console.log(student_details);
    const requestBody = {
      username: student_details.username,
      user_id: student_details.user_id,
      email: student_details.email,
      full_name: student_details.full_name,
      mobile_number: student_details.mobile_number,
      file_id: null,
      guardian_email: student_details.parents_email,
      guardian_mobile_number: student_details.parents_mobile_number,
      reattempt_count: 3,
    };

    const response = await authenticatedAxiosInstance.post(
      `${ASSESSMENT_PREVIEW}`,
      requestBody,
      {
        params: {
          batch_ids: student_details.package_session_id,
          instituteId: institute_id,
          assessment_id: assessment_id,
        },
      }
    );
    console.log(response);
    const transfomredData = transformData(response.data);
    console.log(transfomredData)
    await Storage.set({
      key: "Assessment_questions",
      value: JSON.stringify(response.data),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    toast.error("Failed to fetch assessments.");
  } finally {
    // setLoading(false);
  }
};

export const startAssessment = async () => {
  try {
    const { assessment_id, user_id, attempt_id } = await getStartAssessmentDetails();

    const requestBody = {
      assessment_id: assessment_id,
      user_registration_id: user_id,
      attempt_id: attempt_id,
    };

    const response = await authenticatedAxiosInstance.post(
      `${START_ASSESSMENT}`,
      requestBody
    );
    await Storage.set({
      key: "server_start_end_time",
      value: JSON.stringify(response.data),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    // toast.error("Failed to fetch assessments.");
  } finally {
    // setLoading(false);
  }
};
