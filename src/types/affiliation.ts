//src/types/affiliation.ts
export type affiliationType = 'คณะ' | 'กอง' | 'ศูนย์' | 'อื่นๆ'

export interface Affiliation {
  id: string
  name: string
  type: affiliationType
  parentId: string | null
}
