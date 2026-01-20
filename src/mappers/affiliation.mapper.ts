import { defaultAffiliation } from '@/components/data/Affiliation'

/**
 * Map affiliation name → affiliation id
 * ใช้กับ summary / ledger
 */
export function getAffiliationId(name: string): string {
  if (!name) return 'UNKNOWN'

  const found = defaultAffiliation.find(a => a.name === name)
  return found?.id ?? 'UNKNOWN'
}
