/** @file 用户状态管理模块 - 处理用户登录、权限和信息管理 */

import {defineStore} from 'pinia'
import {computed, reactive, ref} from 'vue'
import {resetRouter} from '@/router'
import {
    getUserIdentity as getUserIdentityApi,
    getUserInfo as getUserInfoApi,
    getParamInfo as getParamInfoApi,
    login as loginApi,
    logout as logoutApi, getParamInfo
} from '@/apis/user'
import {clearMenuId, clearToken, getToken, setToken} from '@/utils/auth'

/** 登录参数接口 */
interface LoginParams {
    account: string
    password: string
    deptId: string
    roleId: string
}

interface IdentityParams {
    account: string
}

/** 用户 Store 的核心设置逻辑 - 管理用户相关的状态和操作 */
const storeSetup = () => {
    /** 用户基本信息 */
    const userInfo = reactive({
        userName: '',
        userPhone: '',
        nickName: '',
        signature: '',
        userId: '',
        email: '',
        gender: '',
        birth: '',
        userStatus: '',
        desc: '',
        deptId: '',
        roleId: '',
        roleCode: '',
        avatar: ''
    })
    // 参数信息
    const paramInfo = reactive({
        deptId: '',
        sysLogo: '',
        sysTitle: '',
        mapDisplayArea: '',
        largeScreenTitle: '',
        contract: '',
        insurance: '',
        annualInspection: ''
    })
    const sysLogo = computed(() => paramInfo.sysLogo)
    const sysTitle = computed(() => paramInfo.sysTitle)
    const mapDisplayArea = computed(() => paramInfo.mapDisplayArea)
    const largeScreenTitle = computed(() => paramInfo.largeScreenTitle)
    const contract = computed(() => paramInfo.contract)
    const insurance = computed(() => paramInfo.insurance)
    const annualInspection = computed(() => paramInfo.annualInspection)

    /** 用户昵称 */
    const nickName = computed(() => userInfo.nickName)
    /** 用户角色列表 */
    const roleId = computed(() => userInfo.roleId)
    const roleCode = computed(() => userInfo.roleCode)
    /** 用户所在部门 */
    const deptId = computed(() => userInfo.deptId)
    /** 用户头像 */
    const avatar = computed(() => userInfo.avatar)
    /** 用户令牌 */
    const token = ref<string>(getToken() || '')
    /** 用户权限列表 */
    const permissions = ref<string[]>([])
    /** 用户身份信息 */
    const identityOptions = ref<any[]>([])

    /** 重置用户令牌 - 清除令牌并重置路由权限标志 */
    const resetToken = () => {
        token.value = ''
        clearToken()
        clearMenuId()
    }
    /**
     * 用户登录
     * @description 处理用户登录请求并保存令牌
     * @param {LoginParams} params - 登录参数
     * @throws {Error} 当登录失败时抛出错误
     */
    const login = async (params: LoginParams): Promise<void> => {
        try {
            const res = await loginApi(params)
            setToken(res.data)
            token.value = res.data
        } catch (error) {
            console.error('登录失败:', error)
            throw error
        }
    }

    /**
     * 获取用户身份信息
     * @description 获取用户身份信息
     * @param {IdentityParams} params - 登录参数
     * @throws {Error} 当失败时抛出错误
     */
    const getUserIdentity = async (params: IdentityParams): Promise<void> => {
        try {
            const res = await getUserIdentityApi(params)
            identityOptions.value = res.data
        } catch (error) {
            console.error('获取用户身份信息失败:', error)
            throw error
        }
    }

    /**
     * 用户退出
     * @description 处理用户退出请求并清除状态
     * @returns {Promise<boolean>} 退出是否成功
     */
    const logout = async (): Promise<boolean> => {
        try {
            const res = await logoutApi()
            if (res.code === 401) {
                // 清除用户状态
                token.value = ''
                resetToken()
                resetRouter()
                permissions.value = []
            }
            return true
        } catch (error) {
            console.error('退出失败:', error)
            return false
        }
    }

    /**
     * 获取用户信息
     * @description 获取用户详细信息，包括角色和权限
     * @throws {Error} 当获取用户信息失败时抛出错误
     */
    const getInfo = async (): Promise<void> => {
        try {
            const res = await getUserInfoApi()
            const {
                userName,
                userPhone,
                nickName,
                userId,
                signature,
                email,
                gender,
                birth,
                userStatus,
                desc,
                deptId,
                roleId,
                roleCode,
                avatar,
                permissions: userPermissions
            } = res.data

            // 更新用户基本信息
            userInfo.userId = userId
            userInfo.userName = userName
            userInfo.userPhone = userPhone
            userInfo.nickName = nickName
            userInfo.roleId = roleId
            userInfo.roleCode = roleCode
            userInfo.deptId = deptId
            userInfo.avatar = avatar
            userInfo.signature = signature
            userInfo.email = email
            userInfo.gender = gender
            userInfo.birth = birth
            userInfo.userStatus = userStatus
            userInfo.desc = desc

            // 更新用户角色和权限
            if (roleId) {
                permissions.value = userPermissions || []
            }
            return true
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }

    /**
     * 获取用户对应组织的配置信息
     */
    const getParamInfo = async (): Promise<void> => {
        try {
            const res = await getParamInfoApi()
            const {
                deptId,
                sysLogo,
                sysTitle,
                mapDisplayArea,
                largeScreenTitle,
                contract,
                insurance,
                annualInspection
            } = res.data

            // 更新用户基本信息
            paramInfo.deptId = deptId
            paramInfo.sysLogo = sysLogo
            paramInfo.sysTitle = sysTitle
            paramInfo.mapDisplayArea = mapDisplayArea
            paramInfo.largeScreenTitle = largeScreenTitle
            paramInfo.contract = contract
            paramInfo.insurance = insurance
            paramInfo.annualInspection = annualInspection
            return true
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }

    /**
     * 更新令牌（仅用于开发测试）
     * @description 用于模拟令牌过期场景
     * @param {string} value - 新的令牌值
     */
    const editToken = (value: string): void => {
        token.value = value
        setToken(value)
    }

    return {
        userInfo,
        nickName,
        avatar,
        token,
        roleId,
        roleCode,
        deptId,
        permissions,
        identityOptions,
        paramInfo,
        sysLogo,
        sysTitle,
        mapDisplayArea,
        largeScreenTitle,
        contract,
        insurance,
        annualInspection,
        login,
        logout,
        getInfo,
        getParamInfo,
        getUserIdentity,
        resetToken,
        editToken
    }
}

/**
 * 用户状态管理 Store
 * @description 创建用户相关的状态管理 store，使用 localStorage 进行持久化存储
 */
export const useUserStore = defineStore('user', storeSetup, {
    persist: {
        paths: ['token'],
        storage: localStorage
    }
})
