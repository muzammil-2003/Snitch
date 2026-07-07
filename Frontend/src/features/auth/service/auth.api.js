import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials: true
});

export const register = async ({ email, contact, password, fullName, isSeller }) => {
    const response = await authApiInstance.post("/register", { email, contact, password, fullName, isSeller })
    return response.data;
}

export const login = async ({ email, password }) => {
    const response = await authApiInstance.post("/login", { email, password })
    return response.data;
}