import { setError, setLoading, setUser } from "../state/auth.slice";
import { register, login } from "../service/auth.api";
import { useDispatch } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch()

    async function handleRegister({ email, contact, password, fullName, isSeller = false }) {
        dispatch(setLoading(true))
        try {
            const response = await register({ email, contact, password, fullName, isSeller })
            dispatch(setUser(response.user))
            dispatch(setLoading(false))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message))
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        dispatch(setLoading(true))
        try {
            const response = await login({ email, password })
            dispatch(setUser(response.user))
            dispatch(setLoading(false))
            dispatch(setError(null))
            return response
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message))
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister, handleLogin
    }
}