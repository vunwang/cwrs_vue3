import axios from 'axios'
import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios'
import NProgress from 'nprogress'
import {getToken, getMenuId} from '@/utils/auth'
import 'nprogress/nprogress.css'
import router from '@/router'
import {ElMessage} from "element-plus";

// 配置 NProgress
NProgress.configure({showSpinner: false})

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
        // 如果是下载请求，直接返回原始 response
        if (response.config?.['isDownload']) {
            NProgress.done()
            return response // 不解析 data
        }
        const {data} = response
        const {msg, code} = data
        if (code && code !== 200) {
            if (code === 401) {
                router.replace('/login')
                ElMessage.success(msg)
                return Promise.reject(msg)
            }
            ElMessage.error(msg)
            return Promise.reject(new Error(msg))
        }

        NProgress.done()
        return response
    }, (error) => {
        NProgress.done()
        // 下载请求的错误也要特殊处理（可能是 JSON 错误）
        if (error.config?.['isDownload'] && error.response?.data instanceof Blob) {
            // 尝试读取错误信息
            error.response.data.text().then((text: string) => {
                try {
                    const json = JSON.parse(text)
                    ElMessage.error(json.msg || '下载失败')
                } catch {
                    ElMessage.error('下载失败，请重试')
                }
            })
        } else {
            const response = Object.assign({}, error.response)
            response && ElMessage.error(response.data.msg || '系统异常, 请检查网络或联系管理员！')
            if (response.status === 401) {
                router.replace('/login')
            }
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

const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'


/** POST 请求 */
// const post = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
//     return request({
//         method: 'post',
//         url,
//         data: params ? filterEmptyStringsAndTrim(params) : params,
//         ...config
//     })
// }
// 修复上传后的post方法
const post = <T = any>(url: string, params?: object | FormData, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    // ✅ 演示模式拦截
    if (IS_DEMO_MODE) {
        ElMessage.warning('演示模式：禁止操作！')
        return Promise.reject(new Error('demo_mode_disabled'))
    }

    let data = params;
  // 仅对普通对象进行过滤处理，FormData直接跳过
  if (params && !(params instanceof FormData)) {
    data = filterEmptyStringsAndTrim(params as Record<string, any>);
  }
  return request({
    method: 'post',
    url,
    data, // 若为FormData，直接使用原始值
    ...config
  })
}
/** PUT 请求 */
const put = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    // ✅ 演示模式拦截
    if (IS_DEMO_MODE) {
        ElMessage.warning('演示模式：禁止操作！')
        return Promise.reject(new Error('demo_mode_disabled'))
    }
    return request({
        method: 'put',
        url,
        data: params ? filterEmptyStringsAndTrim(params) : params,
        ...config
    })
}

/** DEL 请求 */
const del = <T = any>(url: string, params?: object, config?: AxiosRequestConfig): Promise<ApiRes<T>> => {
    // ✅ 演示模式拦截
    if (IS_DEMO_MODE) {
        ElMessage.warning('演示模式：禁止操作！')
        return Promise.reject(new Error('demo_mode_disabled'))
    }
    return request({
        method: 'delete',
        url,
        params: params ? filterEmptyStringsAndTrim(params) : params,
        ...config
    })
}

/**
 * 下载文件（如 Excel）
 * @param url 下载接口地址
 * @param params 请求参数
 * @param filename 默认文件名（可选，也可从响应头解析）
 * @param method 请求方法，默认 POST
 */
const download = (
    url: string,
    params?: object,
    filename?: string,
    method: 'get' | 'post' = 'post'
): Promise<void> => {
    const config: AxiosRequestConfig = {
        url,
        method,
        responseType: 'blob', // 返回二进制
        isDownload: true,     // 标记为下载请求，绕过 JSON 解析
        timeout: 2 * 60 * 1000,   // 2分钟(可适当延长)
    }

    if (method === 'post' || method === 'put') {
        config.data = params ? filterEmptyStringsAndTrim(params) : params
    } else {
        config.params = params ? filterEmptyStringsAndTrim(params) : params
    }

    return http.request(config).then((response) => {
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        // 从 Content-Disposition 解析文件名（更准确）
        const contentDisposition = response.headers['content-disposition']
        let finalFilename = filename || 'export.xlsx'
        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^'"]*)['"]?/i)
            if (match && match[1]) {
                // 支持 filename*=UTF-8''xxx 的编码格式
                finalFilename = decodeURIComponent(match[1])
            }
        }

        // 触发下载
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = finalFilename
        link.click()
        window.URL.revokeObjectURL(link.href)
    })
}

export default {get, post, put, del, download, request}
