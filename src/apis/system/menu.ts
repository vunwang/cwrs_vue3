import type * as T from './type'
import http from '@/utils/http'

/** 获取菜单数据 */
export function getMenuList() {
  return http.get('/sysMenu/getMenuTreeList')
}

/** 获取菜单详情 */
export function getMenuDetail(params: { id: string }) {
  return http.get('/system/menu/getMenuDetail', params)
}

/** 获取角色分配权限菜单树 */
export function getMenuOptions() {
  return http.get('/system/menu/getMenuOptions')
}
