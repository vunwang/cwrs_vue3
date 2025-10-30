import type * as T from './type'
import http from '@/utils/http'

/** 获取用户数据 */
// export function getUserList(params: Pagination) {
//   return http.get('/system/user/getUserList', params)
// }
export function getUserList(params: any) {
  return http.get('/sysUser/list', params)
}
// 删除用户
export function deleteUser(params: any) {
  return http.del('/sysUser/del', params)
}
// 添加用户
export function addUser(params: any) {
  return http.post('/sysUser/add', params)
}
/** 获取用户详情 */
// export function getUserDetail(params: { id: string }) {
//   return http.get('/system/user/getUserDetail', params)
// }
export function getUserDetail(params: { id: string }) {
  return http.get('/sysUser/detail', params)
}
// 重置密码
export function resetPassword(params: any) {
  return http.put('/sysUser/resetPassword', params)
}
/** 修改密码 */
export function editPassword(params: any) {
  return http.put('/sysUser/editPassword', params)
}
// 修改用户信息
export function editUser(params: any) {
  return http.put('/sysUser/edit', params)
}
