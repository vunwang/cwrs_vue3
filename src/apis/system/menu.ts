import http from '@/utils/http'

/** 获取菜单数据 */
export function getMenuList(params: any) {
    return http.get('/sysMenu/getMenuTreeList', params)
}

/** 获取菜单详情 */
export function getMenuDetail(params: any) {
    return http.get('/sysMenu/getSysMenuById', params)
}

/** 获取角色分配权限菜单树 */
//TODO
export function getMenuOptions() {
    return http.get('/system/menu/getMenuOptions')
}

/** 删除菜单 */
export function delMenu(params: any) {
    return http.del('/sysMenu/del', params)
}

/** 新增目录 */
export function addDirectory(params: any) {
    return http.post('/sysMenu/addDirectory', params)
}

/** 新增菜单 */
export function addMenu(params: any) {
    return http.post('/sysMenu/addMenu', params)
}

/** 新增按钮 */
export function addButton(params: any) {
    return http.post('/sysMenu/addButton', params)
}

/** 批量更新菜单父节点 */
export function editMenus(params: any) {
    return http.put('/sysMenu/editMenus', params)
}

/** 修改菜单状态 */
export function editMenuStatus(params: any) {
    return http.put('/sysMenu/editMenuStatus', params)
}

/** 更新目录 */
export function editDirectory(params: any) {
    return http.put('/sysMenu/editDirectory', params)
}

/** 更新菜单 */
export function editMenu(params: any) {
    return http.put('/sysMenu/editMenu', params)
}

/** 更新按钮 */
export function editButton(params: any) {
    return http.put('/sysMenu/editButton', params)
}
