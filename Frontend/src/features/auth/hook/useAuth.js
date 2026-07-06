import { setError, setLoading, setUser } from "../state/auth.slice";
import { register } from "../service/auth.api";
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
        } catch (error) {
            dispatch(setError(error?.response?.data?.message || error.message))
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister
    }
}