import Cookies from 'js-cookie';
import axios from 'axios';
import CONSTANT_NAMES from '../../types/constant';
import { getNewAccessToken } from './jwt';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.vrindavanrasa.com/backend/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A reusable fetch instance with default options

axiosInstance.interceptors.request.use(async (req: any) => {
  //--patch auth token in Headers here
  const rfrToken = Cookies.get(CONSTANT_NAMES.refresh_token)
  const hasJwt = Cookies.get(CONSTANT_NAMES.access_token)
  if (rfrToken) {
      //********Setting headers block
      if (hasJwt) {
          req.headers.Authorization = `Bearer ${hasJwt}`
      }
      else {
          const res = await getNewAccessToken(rfrToken)
          if (res?.success && res?.data) {
              req.headers.Authorization = `Bearer ${res?.data}`
          }
      }
      return req //---Req to primary server
  }
  return req //---Req without jwt

}, (error: any) => {
  return Promise.reject(error)
})