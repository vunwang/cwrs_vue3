import { ref } from 'vue'
import { mapTree } from 'xe-utils'
import { getDeptList as getDeptListApi } from '@/apis/system'

/** 部门模块 */
export function useDept(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const deptList = ref<any[]>([])

  const getDeptList = async () => {
    try {
      loading.value = true
      const res = await getDeptListApi({ deptName: deptName })
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
  return { deptList, getDeptList, loading }
}
