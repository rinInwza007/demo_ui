//Profile.ts
import { roleType } from "./user"
export type sendmoney = 'รายได้' | 'เงินโครงการ'
export type fundName = 'กองทุนทั่วไป' | 'กองทุนพิเศษ'


export interface Profile {
  fullName: string
  phone: string
  role:roleType
  fundName: fundName
  projectCode: string | null
  mainAffiliationId?: string
  mainAffiliationName?: string
  subAffiliationId1?: string
  subAffiliationName1?: string
  subAffiliationId2?: string
  subAffiliationName2?: string
  affiliationId: string
  affiliationName: string
  sendmoney?: sendmoney
}

