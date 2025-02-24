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

    if (response.status === 200) {
      // Case: With Package Session (Multiple Entries)
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
      const packageSessionIds = students.map(
        (student) => student.package_session_id
      );

      // Match all package_session_id with batches_for_sessions
      const matchedSessions = institute.batches_for_sessions.filter(
        (batch: Batch) => packageSessionIds.includes(batch.id)
      );

      console.log("Mapped Sessions:", matchedSessions);

      // Store mapped sessions in sessionList
      await Preferences.set({
        key: "sessionList",
        value: JSON.stringify(matchedSessions),
      });

      console.log("Mapped sessions stored successfully in sessionList!");
    } else if (response.status === 201) {
      // Case: Without Package Session (Single Entry)
      const student: Student = response.data[0];

      // Store single student entry in "StudentDetails"
      await Preferences.set({
        key: "StudentDetails",
        value: JSON.stringify(student),
      });

      console.log("Single student entry stored in StudentDetails.");
      // navigate({ to: "/dashboard" });
    }
  } catch (error) {
    console.error("Failed to fetch and store student details:", error);
    throw error;
  }
};

const storeMappedSessions = async () => {
  try {
    // Get Student Details
    const studentData = await Preferences.get({ key: "students" });
    // if (!studentData.value) throw new Error("No student data found!");

    const students: Student[] = studentData.value ? JSON.parse(studentData.value) : [];
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
    const matchedSessions = institute.batches_for_sessions.filter(
      (batch: Batch) => sessionIds.includes(batch.id)
    );

    console.log("Matched Sessions:", matchedSessions);

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

export const getMappedSessions = async (): Promise<Batch[] | null> => {
  try {
    // Try fetching multiple students first
    let studentData = await Preferences.get({ key: "students" });

    if (!studentData.value) {
      // If no multiple students found, check for single student case
      studentData = await Preferences.get({ key: "StudentDetails" });
      if (!studentData.value) {
        console.warn("No student data found! Returning null.");
        return null; // Instead of throwing an error
      }
    }

    const student: Student = JSON.parse(studentData.value);

    // Fetch stored institute details
    const instituteData = await Preferences.get({ key: "InstituteDetails" });
    if (!instituteData.value) {
      console.warn("No institute data found! Returning null.");
      return null;
    }

    const institute: Institute = JSON.parse(instituteData.value);

    // Ensure batches_for_sessions exist
    if (
      !institute.batches_for_sessions ||
      institute.batches_for_sessions.length === 0
    ) {
      console.warn("No batches found in institute details! Returning null.");
      return null;
    }

    // Filter student package_session_id with institute batches_for_sessions
    const matchedSessions = institute.batches_for_sessions.filter(
      (batch: Batch) => batch.id === student.package_session_id
    );

    if (matchedSessions.length === 0) {
      console.warn("No matching sessions found!");
      return null;
    }

    console.log("Mapped Sessions:", matchedSessions);
    return matchedSessions;
  } catch (error) {
    console.error("Error mapping sessions:", error);
    return null;
  }
};
