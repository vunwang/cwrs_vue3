import axios from 'axios'
import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import {Message, Notification} from '@arco-design/web-vue'
import NProgress from 'nprogress'
import {getToken, getMenuId} from '@/utils/auth'
import 'nprogress/nprogress.css'
import router from '@/router'
import qs from "qs";

// 配置 NProgress
NProgress.configure({showSpinner: false})

/** 状态码消息映射 */
const StatusCodeMessage: Record<number, string> = {
    200: '服务器成功响应请求',
    202: '一个请求已经进入后台排队（异步任务）',
    400: '请求错误',
    401: '未授权，请重新登录',
    403: '拒绝访问',
    404: '请求出错',
    408: '请求超时',
    412: '缺少参数',
    422: '参数验证失败',
    500: '服务器错误',
    501: '服务未实现',
    502: '网络错误',
    503: '服务不可用',
    504: '网络超时'
}

/** 创建 axios 实例 */
const http: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30 * 1000,
})

// 请求拦截器
http.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        NProgress.start()
        const token = getToken()
        if (token) {
            config.headers['Token'] = token
        }
        // 菜单ID存储在localStorage中
        const menuId = getMenuId();
        if (menuId) {
            // 将菜单ID塞入请求头中
            config.headers['Menu-ID'] = menuId;
        }
        return config
    },
    (error) => {
        NProgress.done()
        return Promise.reject(error)
    }
)

// 响应拦截器
http.interceptors.response.use(
    (response: AxiosResponse) => {
        // const {data} = response
        // const {msg, code} = data
        // if (code !== 200) {
        //     Message.error(msg)
        //     return Promise.reject(new Error(msg))
        // }

        NProgress.done()
        return response
    }, (error) => {
        NProgress.done()
        Message.clear()
        const response = Object.assign({}, error.response)
        response && Message.error(response.data.msg || '系统异常, 请检查网络或联系管理员！')
        if (response.status === 401) {
            router.replace('/login')
        }
        return Promise.reject(error)
    }
)

/** 封装请求方法 */
const request = <T = unknown>(config: AxiosRequestConfig): Promise<ApiRes<T>> => {
    return new Promise((resolve, reject) => {
        http
            .request<T>(config)
            .then((res: AxiosResponse) => resolve(res.data))
            .catch((err: { message: string }) => reject(err))
    })
}

function filterEmptyStringsAndTrim<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
        // 检查 value 是否为 null 或 undefined，如果是则跳过
        if (value === null || value === undefined) {
            return; // 直接跳过本次循环，不添加到 result
        }

        if (typeof value === 'string') {
            // 对于字符串类型，先 trim() 去除首尾空白
            const trimmedValue = value.trim();
            // 如果 trim() 后不为空，则将**去除空格后的值**添加到result 如果 trim() 后为空，则跳过（不添加）
            if (trimmedValue !== '') {
                result[key as keyof T] = trimmedValue as T[keyof T]; // 注意类型
            }
        } else {
            // 对于非字符串类型（且不为 null/undefined），直接添加
            result[key as keyof T] = value;
        }
    });

    return result;
}

/** GET 请求 */
const get = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    return request({
        method: 'get',
        url,
        params: params ? filterEmptyStringsAndTrim(params) : params,
        ...config
    })
}

/** POST 请求 */
const post = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    return request({
        method: 'post',
        url,
        data: params ? filterEmptyStringsAndTrim(params) : params,
        ...config
    })
}

/** PUT 请求 */
const put = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    return request({
        method: 'put',
        url,
        data: params ? filterEmptyStringsAndTrim(params) : params,
        ...config
    })
}

/** DEL 请求 */
const del = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    return request({
        method: 'delete',
        url,
        params: params ? filterEmptyStringsAndTrim(params) : params,
        ...config
    })
}

export default {get, post, put, del, request}
