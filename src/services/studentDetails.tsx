import { Preferences } from "@capacitor/preferences";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { STUDENT_DETAIL } from "@/constants/urls";

interface Student {
  id: string;
  username: string;
  user_id: string;
  email: string;
  full_name: string;
  address_line: string;
  region: string | null;
  city: string;
  pin_code: string | null;
  mobile_number: string;
  date_of_birth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  father_name: string;
  mother_name: string;
  parents_mobile_number: string;
  parents_email: string;
  linked_institute_name: string;
  package_session_id: string;
  institute_enrollment_id: string;
  status: "ACTIVE" | "INACTIVE";
  session_expiry_days: number | null;
  institute_id: string;
  face_file_id: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Batch {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  session_ids: string[];
}

interface Institute {
  id: string;
  name: string;
  batches_for_sessions: Batch[];
}

export const fetchAndStoreStudentDetails = async (
  instituteId: string,
  userId: string
) => {
  try {
    const response = await authenticatedAxiosInstance({
      method: "GET",
      url: STUDENT_DETAIL,
      params: { instituteId, userId },
    });

    const students: Student[] = response.data;

    // Store raw student details
    await Preferences.set({
      key: "students",
      value: JSON.stringify(students),
    });

    // Fetch stored institute details
    const instituteData = await Preferences.get({ key: "InstituteDetails" });
    if (!instituteData.value) throw new Error("No institute data found!");
    
    const institute: Institute = JSON.parse(instituteData.value);

    // Ensure batches_for_sessions exist
    if (!institute.batches_for_sessions)
      throw new Error("No batches found in institute details!");

    // Extract package_session_id from student details
    const packageSessionIds = students.map((student) => student.package_session_id);

    // Match all package_session_id with batches_for_sessions
    const matchedSessions = institute.batches_for_sessions.filter((batch: Batch) =>
      packageSessionIds.includes(batch.id)
    );

    console.log("Mapped Sessions:", matchedSessions);

    // Store mapped sessions in sessionList
    await Preferences.set({
      key: "sessionList",
      value: JSON.stringify(matchedSessions),
    });

    console.log("Mapped sessions stored successfully in sessionList!");
  } catch (error) {
    console.error("Failed to fetch and store student details:", error);
    throw error;
  }
};

const storeMappedSessions = async () => {
  try {
    // Get Student Details
    const studentData = await Preferences.get({ key: "students" });
    if (!studentData.value) throw new Error("No student data found!");
    
    const students: Student[] = JSON.parse(studentData.value);
    console.log("Student Details:", students);

    // Get Institute Details
    const instituteData = await Preferences.get({ key: "InstituteDetails" });
    if (!instituteData.value) throw new Error("No institute data found!");
    
    const institute: Institute = JSON.parse(instituteData.value);
    console.log("Institute Details:", institute);

    // Extract package_session_id from students
    const sessionIds = students.map((s: Student) => s.package_session_id);
    console.log("Extracted package_session_id list:", sessionIds);

    // Filter batches that match package_session_id
    const matchedSessions = institute.batches_for_sessions.filter((batch: Batch) =>
      sessionIds.includes(batch.id)
    );

    console.log("Matched Sessions:", matchedSessions);

    // Store mapped data
    await Preferences.set({
      key: "DifferentSessions",
      value: JSON.stringify(matchedSessions),
    });

    console.log("Successfully stored DifferentSessions!");
  } catch (error) {
    console.error("Error in storing mapped sessions:", error);
  }
};

// Call this function where needed (e.g., after fetching student & institute data)
storeMappedSessions();

export const getStoredStudentDetails = async (): Promise<Student[] | null> => {
  try {
    console.log("Retrieving stored student details...");
    const { value } = await Preferences.get({ key: "students" });
    console.log("Stored student details retrieved:", value);
    return value ? (JSON.parse(value) as Student[]) : null;
  } catch (error) {
    console.error("Error parsing stored student details:", error);
    return null;
  }
};

export const getInstituteDetails = async (): Promise<Institute | null> => {
  try {
    console.log("Retrieving institute details...");
    const { value } = await Preferences.get({ key: "InstituteDetails" });
    console.log("Institute details retrieved:", value);
    return value ? (JSON.parse(value) as Institute) : null;
  } catch (error) {
    console.error("Failed to retrieve institute details:", error);
    return null;
  }
};

export const getMappedSessions = async (): Promise<Batch[] | null> => {
  try {
    // Fetch stored student details
    const studentData = await Preferences.get({ key: "studentSessions" });
    if (!studentData.value) throw new Error("No student data found!");
    
    const student: Student = JSON.parse(studentData.value);

    // Fetch stored institute details
    const instituteData = await Preferences.get({ key: "InstituteDetails" });
    if (!instituteData.value) throw new Error("No institute data found!");
    
    const institute: Institute = JSON.parse(instituteData.value);

    console.log("Student Data:", student);
    console.log("Institute Data:", institute);

    // Ensure batches_for_sessions exist
    if (!institute.batches_for_sessions)
      throw new Error("No batches found in institute details!");

    // Filter student package_session_id with institute batches_for_sessions
    const matchedSessions = institute.batches_for_sessions.filter(
      (batch: Batch) => batch.id === student.package_session_id
    );

    if (matchedSessions.length === 0) {
      console.warn("No matching sessions found!");
      return null;
    }

    console.log("Mapped Sessions:", matchedSessions);

    // Store mapped sessions in studentSessions
    await Preferences.set({
      key: "studentSessions",
      value: JSON.stringify(matchedSessions),
    });

    console.log("Mapped sessions stored in studentSessions successfully!");
    return matchedSessions;
  } catch (error) {
    console.error("Error mapping sessions:", error);
    return null;
  }
};
