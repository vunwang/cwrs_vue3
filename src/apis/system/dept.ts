import http from '@/utils/http'

/** 获取部门数据 */
export function getDeptList(params: any) {
  return http.get('/sysDept/tree',params)
}

/** 获取部门详情 */
export function getDeptDetail(params: any) {
  return http.get('/sysDept/detail', params)
}

/** 新增部门 */
export function addDept(params: any) {
  return http.post('/sysDept/add', params)
}

/** 编辑部门 */
export function editDept(params: any) {
  return http.put('/sysDept/edit', params)
}

/** 删除部门 */
export function delDept(params: any) {
  return http.del('/sysDept/del', params)
}
