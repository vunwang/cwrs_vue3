import type * as T from './type'
import http from '@/utils/http'
import type { MenuItem } from '@/apis/system'

export type * from './type'

/** 登录 */
export function login(data: { account: string, password: string }) {
  return http.get('/sysLogin/login', data)
}

/** 获取用户身份 */
export function getUserIdentity(data: { account: string }) {
  return http.get('/sysLogin/getUserIdentity', data)
}

/** 退出登录 */
export function logout() {
  return http.post('/user/logout')
}

/** 获取用户信息 */
export const getUserInfo = () => {
  return http.get('/sysLogin/getUserInfo')
}

/** 获取用户路由信息 */
export const getUserRoutes = () => {
  return http.get('/sysMenu/getMenuTreeByRoleId')
}