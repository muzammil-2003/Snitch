import { setError, setLoading, setUser } from "../state/auth.slice";
import { register, login, getMe } from "../service/auth.api";
import { useDispatch } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch()

    async function handleRegister({ email, contact, password, fullName, isSeller = false }) {
        try {
            const response = await register({ email, contact, password, fullName, isSeller })
            dispatch(setUser(response.user))
            dispatch(setLoading(false))
            dispatch(setError(null))
            return response.user
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message))
            dispatch(setLoading(false))
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            const response = await login({ email, password })
            dispatch(setUser(response.user))
            dispatch(setLoading(false))
            dispatch(setError(null))
            return response.user
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message))
            dispatch(setLoading(false))
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            const response = await getMe()
            dispatch(setUser(response.user))
            dispatch(setLoading(false))
            dispatch(setError(null))
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message))
            dispatch(setLoading(false))
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister, handleLogin, handleGetMe
    }
}