import CONSTANT_NAMES from "../../types/constant"
import Cookies from "js-cookie"
import { API_BASE_URL } from "./apiConfig"



//---Saving the access token (15 minutes)
export const saveAccessToken = (token: string) => {
    Cookies.set(CONSTANT_NAMES.access_token, token, { expires: 365 }) // 1 year
}

//---Saving the refresh token (5 minutes)
export const saveRefreshToken = (rfrToken: string) => {
    Cookies.set(CONSTANT_NAMES.refresh_token, rfrToken, { expires: 365 })  //Session
}

//---Removing access token and refresh token
export const destroyTokens = () => {
    Cookies.remove(CONSTANT_NAMES.access_token)
    Cookies.remove(CONSTANT_NAMES.refresh_token)
}


export const getNewAccessToken = async (rfrToken: string) => {
    try {
        const newAcessToken = await fetch(`${API_BASE_URL}user/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rfrToken })
        })
        const parsedResponse = await newAcessToken.json()

        if (newAcessToken && parsedResponse?.data?.token && parsedResponse?.data?.refreshToken) {
            //Setting new access token in cookies
            saveAccessToken(parsedResponse?.data?.token)
            saveRefreshToken(parsedResponse?.data?.refreshToken)
            return { success: true, data: parsedResponse?.data?.token } //returning the payload to the invoker
        }
        throw new Error("Api didn't bring access token")
    }
    catch (error: any) {
        destroyTokens()
        return { success: false, data: null }
    }
}