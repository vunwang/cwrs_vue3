import http from '@/utils/http'
/** 分页查询系统参数列表 */
export function getParamList(params: any) {
  return http.get('/sysParam/list', params)
}

/** 新增系统参数 */
export function addSysParam(params: any) {
  return http.post('/sysParam/add', params)
}

/** 修改系统参数 */
export function editSysParam(params: any) {
  return http.put('/sysParam/edit', params)
}

/** 删除系统参数 */
export function delSysParam(params: any) {
  return http.del('/sysParam/del', params)
}
/**查询系统参数详情*/
export function detailSysParam(params: { paramId: string }) {
  return http.get('/sysParam/detail', params)
}

