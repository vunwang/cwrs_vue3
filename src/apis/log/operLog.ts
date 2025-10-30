import http from '@/utils/http'
/** 分页查询留言列表 */
export function getOperLogList(params: any) {
  return http.get('/sysOperLog/list', params)
}


/**查询留言*/
export function detailOperLog(params: { operId: string }) {
  return http.get('/sysOperLog/detail', params)
}