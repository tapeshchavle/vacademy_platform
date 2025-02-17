import { Preferences } from "@capacitor/preferences";

export const getPackageSessionId = async () => {
    const USER_ID_KEY = 'StudentDetails';
    const userDetailsStr = await Preferences.get({ key: USER_ID_KEY });
    const userDetails = userDetailsStr.value ? JSON.parse(userDetailsStr.value) : null;
    const package_session_id = userDetails?.package_session_id  || null;
    return package_session_id;
};
