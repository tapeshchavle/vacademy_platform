import {
  GET_OPEN_REGISTRATION_DETAILS,
  GET_PARTICIPANTS_STATUS,
  STUDENT_DETAIL,
} from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import axios from "axios";

const handleGetOpenTestRegistrationDetails = async (code: string | number) => {
  const response = await axios({
    method: "GET",
    url: GET_OPEN_REGISTRATION_DETAILS,
    params: {
      code: code,
    },
  });
  return response?.data;
};
export const getOpenTestRegistrationDetails = (code: string | number) => {
  return {
    queryKey: ["GET_OPEN_REGISTRATION_DETAILS", code],
    queryFn: () => handleGetOpenTestRegistrationDetails(code),
    staleTime: 3600000,
  };
};

export const handleGetParticipantsTest = async (
  assessmentId: string,
  instituteId: string,
  userId: string | undefined,
  psIds?: string
) => {
  const response = await authenticatedAxiosInstance({
    method: "GET",
    url: GET_PARTICIPANTS_STATUS,
    params: {
      assessmentId,
      instituteId,
      userId,
      ...(psIds && { psIds }),
    },
  });
  return response?.data;
};

export const handleGetStudentDetailsOfInstitute = async (
  instituteId: string
) => {
  const response = await authenticatedAxiosInstance({
    method: "GET",
    url: STUDENT_DETAIL,
    params: {
      instituteId,
    },
  });
  return response?.data;
};
