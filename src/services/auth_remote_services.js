import { axiosInstance } from "./axios_instance";

/**
 * Authentication response type
 * @typedef {Object} AuthResponse
 * @property {string} token - Authentication token
 * @property {Object} user - User data
 */

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<AuthResponse>} Authentication response with token and user data
 */
export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post("/api/auth/login", {
            email,
            password,
        });

        return response.data;
    } catch (error) {
        console.log("got error: ", error);
        const msg = error?.response?.data?.error || "Login Failed";
        throw new Error(msg);
    }
};

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<AuthResponse>} Authentication response with token and user data
 */
export const register = async (email, password, name) => {
    try {
        const response = await axiosInstance.post("/api/auth/register", {
            email,
            password,
            name,
        });

        return response.data;
    } catch (error) {
        console.log("got error: ", error);
        const msg = error?.response?.data?.error || "Register Failed";
        throw new Error(msg);
    }
};
