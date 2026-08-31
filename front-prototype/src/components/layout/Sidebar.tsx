import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { navigation } from '@/config/navigation'
import { cn } from '@/lib/utils'

function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function Sidebar() {
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    订单管理: true,
  })

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-semibold">导航菜单</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((group) => {
          const isExpanded = expandedGroups[group.title] ?? true
          const hasActiveChild = group.children?.some((item) =>
            item.path ? isPathActive(location.pathname, item.path) : false,
          )

          return (
            <div key={group.title} className="space-y-1">
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  hasActiveChild && 'text-sidebar-primary',
                )}
                onClick={() =>
                  setExpandedGroups((current) => ({
                    ...current,
                    [group.title]: !isExpanded,
                  }))
                }
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform',
                    isExpanded ? 'rotate-0' : '-rotate-90',
                  )}
                  aria-hidden="true"
                />
              </button>
              {isExpanded &&
                group.children?.map((item) =>
                  item.path ? (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-lg px-3 py-2 pl-6 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isActive &&
                            'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                        )
                      }
                    >
                      {item.title}
                    </NavLink>
                  ) : null,
                )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
