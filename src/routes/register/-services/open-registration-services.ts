import { GET_OPEN_REGISTRATION_DETAILS } from "@/constants/urls";
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
