import {
  getTokenDecodedData,
  getTokenFromStorage,
} from "@/lib/auth/sessionUtility";
import { TokenKey } from "e:/Vidyayatan/frontend-admin-dashboard/src/constants/auth/tokens";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";

export function convertToLocalDateTime(utcDate: string): string {
  const date = new Date(utcDate);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = date.toLocaleString("en-GB", options);
  return formattedDate
    .replace(",", "")
    .replace(/\s(am|pm)/i, (match) => match.toUpperCase());
}

export function extractDateTime(utcDate: string) {
  const [date, time] = [
    utcDate.split(" ").slice(0, 3).join(" "),
    utcDate.split(" ").slice(3).join(" "),
  ];

  return { date, time };
}

export function getInstituteId() {
  const accessToken = getTokenFromStorage(TokenKey.accessToken);
  const data = getTokenDecodedData(accessToken);
  const INSTITUTE_ID = data && Object.keys(data.authorities)[0];
  return INSTITUTE_ID;
}

// protection
export const disableProtection = async () => {
  await PrivacyScreen.disable();
};

export const enableProtection = async () => {
  await PrivacyScreen.enable();
};

export const getSubjectNameById = (subjects: Subject[], id: string | null): string => {
  const subject = subjects.find((item) => item.id === id);
  return subject?.subject_name || "N/A";
};