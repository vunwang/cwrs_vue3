import { ref } from 'vue'
import { type RoleItem, getRoleList as getRoleListApi } from '@/apis/system'

/** 角色模块 */
export function useRole() {
  const loading = ref(false)
  const roleList = ref<RoleItem[]>([])
  const total = ref(0)
  const getRoleList = async () => {
    try {
      loading.value = true
      const res = await getRoleListApi({ pageNum: 0, pageSize: 0 })
      roleList.value = res.data.records.filter((i) => i.status === 1)
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }
  return { roleList, getRoleList, loading, total }
}
