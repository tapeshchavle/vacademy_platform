import { Preferences } from "@capacitor/preferences";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { GET_DASHBOARD_DATA , GET_NOTIFCATIONS , GET_ANNOUNCEMENTS} from "@/constants/urls";

export const fetchUserData = async () => {
  const studentData = await Preferences.get({ key: "StudentDetails" });

  const userData = studentData.value ? JSON.parse(studentData.value) : null;
  return userData;
};

export const fetchStaticData = async (
  setUsername: (username: string | null) => void,
  setData: (data: any) => void
) => {
  const userData = await fetchUserData();
  const first_name = userData.full_name.split(" ")[0];
  setUsername(first_name);
  try {
    const url = GET_DASHBOARD_DATA;
    const response = await authenticatedAxiosInstance.get(
      `${url}`
    );
    setData(response.data);
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }
};

export const fetchNotifications = async ()=>{
  try {
    const url = GET_NOTIFCATIONS;
    const response = await authenticatedAxiosInstance({
      method : "GET",
      url : url,
    })
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }
}

export const fetchAnnouncements = async ()=>{
  try {
    const url = GET_ANNOUNCEMENTS;
    const response = await authenticatedAxiosInstance({
      method : "GET",
      url : url,
    })
    return response.data;
  } catch (error) {
    console.error("Error fetching assessments:", error);
  }

}
