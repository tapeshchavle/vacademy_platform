import { Preferences } from "@capacitor/preferences";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import {
  GET_DASHBOARD_DATA,
  GET_NOTIFCATIONS,
  GET_ANNOUNCEMENTS,
  GET_ASSESSMENT_COUNT,
} from "@/constants/urls";

export const fetchUserData = async () => {
  const studentData = await Preferences.get({ key: "StudentDetails" });

  const userData = studentData.value ? JSON.parse(studentData.value) : null;
  return userData;
};

export const fetchStaticData = async (
  setUsername: (username: string | null) => void,
  setData: (data: any) => void,
  setAssessmentCount: (count: number) => void
) => {
  const userData = await fetchUserData();
  const first_name = userData.full_name.split(" ")[0];
  const institute_id = userData.institute_id;
  const batch_id = userData.package_session_id;
  const params = {instituteId : institute_id}
  setUsername(first_name);
  try {
    const url = GET_DASHBOARD_DATA;
    const response = await authenticatedAxiosInstance({
      method : "GET",
      url,
      params,
    });
    setData(response.data);
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }
  try {
    const url = GET_ASSESSMENT_COUNT;
    const response = await authenticatedAxiosInstance({
      method: "GET",
      url,
      params: { instituteId: institute_id, batchId: batch_id },
    });
    setAssessmentCount(response.data);
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }
};

export const fetchNotifications = async () => {
  try {
    const url = GET_NOTIFCATIONS;
    const response = await authenticatedAxiosInstance({
      method: "GET",
      url: url,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }
};

export const fetchAnnouncements = async () => {
  try {
    const url = GET_ANNOUNCEMENTS;
    const response = await authenticatedAxiosInstance({
      method: "GET",
      url: url,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }
};
