import {ref} from 'vue'
import {mapTree} from 'xe-utils'
import {getDeptList as getDeptListApi} from '@/apis/system'

/** 部门模块 */
export function useDept(options?: { onSuccess?: () => void }) {
    const loading = ref(false)
    const deptList = ref<any[]>([])
    const deptSelectList = ref<any[]>([])

    const getDeptList = async (params: any) => {
        try {
            loading.value = true
            const res = await getDeptListApi(params)
            deptSelectList.value = mapTree(res.data, (i) => {
                if (i.children?.length) {
                    i.children = i.children.filter((i) => i.deptStatus === '1')
                }
                return i
            })

            res.data.push({deptId: '', deptName: '全部', deptStatus: '1', deptSort: 0})
            res.data.sort((a, b) => a.deptSort - b.deptSort)

            deptList.value = mapTree(res.data, (i) => {
                if (i.children?.length) {
                    i.children = i.children.filter((i) => i.deptStatus === '1')
                }
                return i
            })

            options?.onSuccess && options.onSuccess()
        } finally {
            loading.value = false
        }
    }
    return {deptList, deptSelectList, getDeptList, loading}
}
