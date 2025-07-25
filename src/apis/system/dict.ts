import type { SelectOptionData } from '@arco-design/web-vue'
import type * as T from './type'
import http from '@/utils/http'

/** 获取字典数据列表 */
export function getDictList(params: any) {
  return http.get('/sysDict/list', params)
}

/** 获取字典详情 */
export function getDictDetail(params: any) {
  return http.get('/sysDict/detail', params)
}

/** 添加字典 */
export function addDict(params: any) {
  return http.post('/sysDict/add', params)
}

/** 修改字典 */
export function editDict(params: any) {
  return http.put('/sysDict/edit', params)
}

/** 删除字典 */
export function delDict(params: any) {
  return http.del('/sysDict/del', params)
}

/** 字典项数据列表 */
export function getDictDataList(params: any) {
  return http.get('/sysDictItem/list', params)
}

/** 字典项数据详情 */
export function getDictItemDetail(params: any) {
  return http.get('/sysDictItem/detail', params)
}

/** 添加字典项 */
export function addDictItem(params: any) {
  return http.post('/sysDictItem/add', params)
}

/** 修改字典项 */
export function editDictItem(params: any) {
  return http.put('/sysDictItem/edit', params)
}

/** 删除字典项 */
export function delDictItem(params: any) {
  return http.del('/sysDictItem/del', params)
}

/** 获取字典数据映射 */
export function getDictData() {
  return http.get('/sysDict/allMap')
}
