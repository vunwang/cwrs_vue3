import http from '@/utils/http'
/** 分页查询任务列表 */
export function getTaskList(params: any) {
  return http.get('/sysTask/list', params)
}

// /** 新增任务 */
export function addTask(params: any) {
  return http.post('/sysTask/add', params)
}

// /** 修改定时任务 只能修改停止状态的任务 */
export function editTask(params: any) {
  return http.put('/sysTask/edit', params)
}

// /** 删除任务 */
export function delTask(params: any) {
  return http.del('/sysTask/del', params)
}
// /**查询任务*/
export function detailTask(params: { taskId: string }) {
  return http.get('/sysTask/detail', params)
}
/** 启动任务 */
export function startTask(params: any) {
  return http.get('/sysTask/start', params)
}
/** 停止任务 */
export function stopTask(params: any) {
  return http.get('/sysTask/stop', params)
}