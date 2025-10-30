
import http from '@/utils/http'

/** 获取角色数据 */
// export function getRoleList(params: Pagination) {
//   return http.get('/system/role/getRoleList', params)
// }
export function getRoleList(params: any) {
  return http.get('/sysRole/list', params)
}

/** 删除角色 */
export function delRole(params: any) {
  return http.del('/sysRole/del', params)
}

/** 获取角色详情 */
export function getRoleDetail(params: { roleId: string }) {
  return http.get('/sysRole/detail', params)
}

/** 新增角色 */
export function addRole(params: any) {
  return http.post('/sysRole/add', params)
}
// 修改角色/sysRole/edit
export function updateRole(params: any) {
  return http.put('/sysRole/edit', params)
}

/** 获取角色详情 */
// export function getRoleDetail(params: { id: string }) {
//   return http.get('/system/role/getRoleDetail', params)
// }

/** 获取角色权限 */
export function getRoleMenuIds(params: { role: string }) {
  return http.get('/system/role/getRoleMenuIds', params)
}
