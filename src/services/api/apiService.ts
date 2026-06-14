// src/services/api/apiService.ts

import { axiosInstance } from './apiConfig';

export async function getData(url: string) {
  try {
    const res = await axiosInstance.get(url);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function postData(url: string, data: any) {
  try {
    const res = await axiosInstance.post(url, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function putData(url: string, data: any) {
  try {
    const res = await axiosInstance.put(url, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function deleteData(url: string) {
  try {
    const res = await axiosInstance.delete(url);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
