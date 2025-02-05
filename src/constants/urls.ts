export const BASE_URL = "https://backend-stage.vacademy.io";

// urls
export const LOGIN_URL = `${BASE_URL}/auth-service/learner/v1/login`;
export const REQUEST_OTP = `${BASE_URL}/auth-service/learner/v1/request-otp`;
export const LOGIN_OTP = `${BASE_URL}/auth-service/learner/v1/login-otp`;
export const REFRESH_TOKEN_URL = `${BASE_URL}/auth-service/learner/v1/refresh-token`;
export const INSTITUTE_DETAIL = `${BASE_URL}/admin-core-service/learner/v1/details`;
export const STUDENT_DETAIL = `${BASE_URL}/admin-core-service/learner/info/v1/details`;
export const Assessment_List_Filter = `${BASE_URL}/assessment-service/assessment/learner/assessment-list-filter`;
export const GET_TEXT_VIA_IDS = `${BASE_URL}/assessment-service/assessment/rich-text/by-ids`;
export const ASSESSMENT_PREVIEW = `${BASE_URL}/assessment-service/assessment/learner/assessment-start-preview`;
export const START_ASSESSMENT = `${BASE_URL}/assessment-service/assessment/learner/assessment-start-assessment`;
export const ASSESSMENT_SAVE = `${BASE_URL}/assessment-service/assessment/learner/status/update`;
export const ASSESSMENT_SUBMIT = `${BASE_URL}/assessment-service/assessment/learner/status/submit`;
