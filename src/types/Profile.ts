//Profile.ts
export interface Profile {
  fullName: string
  phone: string
  fundName: string
  projectCode: string | null
  mainAffiliationId?: string
  mainAffiliationName?: string
  subAffiliationId1?: string
  subAffiliationName1?: string
  subAffiliationId2?: string
  subAffiliationName2?: string
  affiliationId: string
  affiliationName: string
    moneyType: string
  sendmoney?: string
}