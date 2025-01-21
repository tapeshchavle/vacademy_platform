import { Storage } from '@capacitor/storage';
import { TokenKey } from "@/constants/auth/tokens";
import axios from "axios";
import { isTokenExpired } from "./sessionUtility"; // Utility for JWT expiration checks

// Helper functions to interact with Capacitor Storage
const getTokenFromStorage = async (key: string): Promise<string | null> => {
    const { value } = await Storage.get({ key });
    return value;
};

const removeTokens = async () => {
    await Storage.remove({ key: TokenKey.accessToken });
    await Storage.remove({ key: TokenKey.refreshToken });
};

const refreshTokens = async (refreshToken: string): Promise<void> => {
    try {
        const response = await axios.post("/auth/refresh", { refreshToken }); // Adjust endpoint as needed
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store the new tokens
        await Storage.set({ key: TokenKey.accessToken, value: accessToken });
        await Storage.set({ key: TokenKey.refreshToken, value: newRefreshToken });
    } catch (error) {
        console.error("Error refreshing token", error);
        throw error;
    }
};

// Create an instance of Axios
const authenticatedAxiosInstance = axios.create();

// Request interceptor: gets called before every request
authenticatedAxiosInstance.interceptors.request.use(
    async (request) => {
        let accessToken = await getTokenFromStorage(TokenKey.accessToken);

        // Check if the access token is expired
        if (!accessToken || isTokenExpired(accessToken)) {
            try {
                // If the access token is expired, refresh it
                const refreshToken = await getTokenFromStorage(TokenKey.refreshToken);
                if (!refreshToken) throw new Error("No refresh token found");

                // Refresh tokens
                await refreshTokens(refreshToken);

                // Retrieve the new access token
                accessToken = await getTokenFromStorage(TokenKey.accessToken);
            } catch (error) {
                console.error("Error refreshing token: Logging out ...", error);

                // If token refresh fails, remove tokens
                await removeTokens();

                // Reject the request with an error indicating that the user is not authenticated
                return Promise.reject(new Error("Unauthorized"));
            }
        }

        // After token is either retrieved or refreshed, add it to the request headers
        request.headers.Authorization = `Bearer ${accessToken}`;
        return request;
    },

    async (error) => {
        return Promise.reject(error);
    },
);

export default authenticatedAxiosInstance;
