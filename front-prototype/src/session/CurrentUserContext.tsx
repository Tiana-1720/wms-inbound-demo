import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/** 主 PRD §七 角色，不新建权限引擎，仅原型会话切换 */
export const APP_ROLES = ['总部作业部', '加盟揽收仓操作员', '集货仓操作员'] as const

export type AppRole = (typeof APP_ROLES)[number]

export type CurrentUser = {
  name: string
  role: AppRole
  warehouses: string[]
}

const ROLE_PRESETS: Record<AppRole, CurrentUser> = {
  总部作业部: {
    name: '管理员',
    role: '总部作业部',
    warehouses: ['NC', 'GZ', 'YW', 'DG'],
  },
  加盟揽收仓操作员: {
    name: '南昌仓操作员',
    role: '加盟揽收仓操作员',
    warehouses: ['NC'],
  },
  集货仓操作员: {
    name: '东莞仓操作员',
    role: '集货仓操作员',
    warehouses: ['DG'],
  },
}

const CurrentUserContext = createContext<{
  user: CurrentUser
  setRole: (role: AppRole) => void
} | null>(null)

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>('总部作业部')
  const value = useMemo(() => ({ user: ROLE_PRESETS[role], setRole }), [role])

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)
  if (!context) {
    throw new Error('useCurrentUser 必须在 CurrentUserProvider 内使用')
  }
  return context
}
