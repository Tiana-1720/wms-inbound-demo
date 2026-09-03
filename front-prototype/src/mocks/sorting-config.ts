export type SortingConfig = {
  /** 小票阈值 M：预报箱数 ≤ M 为小票 */
  smallTicketThreshold: number
  /** 小票混托票数上限 P */
  smallTicketMixMax: number
}

const STORAGE_KEY = 'wms-sorting-config'

const DEFAULT_CONFIG: SortingConfig = {
  smallTicketThreshold: 15,
  smallTicketMixMax: 5,
}

export function getSortingConfig(): SortingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    const parsed = JSON.parse(raw) as Partial<SortingConfig>
    return {
      smallTicketThreshold:
        parsed.smallTicketThreshold ?? DEFAULT_CONFIG.smallTicketThreshold,
      smallTicketMixMax:
        parsed.smallTicketMixMax ?? DEFAULT_CONFIG.smallTicketMixMax,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function saveSortingConfig(config: SortingConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function isSortingConfigReady(config: SortingConfig) {
  return config.smallTicketThreshold > 0 && config.smallTicketMixMax > 0
}
