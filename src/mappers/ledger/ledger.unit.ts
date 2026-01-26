export function deriveUnit(r: any) {
  return {
    unitKey:
      r.subAffiliationId2 ||
      r.subAffiliationId1 ||
      r.affiliationId,

    faculty: r.affiliationName ?? '',
    sub1: r.subAffiliationName1 ?? '',
    sub2: r.subAffiliationName2 ?? '',
  }
}
