import type * as T from './type'
import http from '@/utils/http'

/** 获取岗位数据 */
export function getPostList(params: any) {
  return http.get('/sysPost/list', params)
}

/** 新增岗位 */
export function addSysPost(params: any) {
  return http.post('/sysPost/add', params)
}

/** 编辑岗位 */
export function editSysPost(params: any) {
  return http.post('/sysPost/edit', params)
}

/** 删除岗位 */
export function delSysPost(params: any) {
  return http.post('/sysPost/del', params)
}

/** 获取岗位详情 */
export function getPostDetail(params: any) {
  return http.get('/sysPost/detail', params)
}
