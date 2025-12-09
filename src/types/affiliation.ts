
export type affiliationType = 'คณะ' | 'กอง' | 'ศูนย์' | 'อื่นๆ';


export interface Affiliation {
  /** Affiliation ID */
  id: string;
  /** Main affiliation name */
  AffiliationName: string;
  /** Sub affiliation name */
  /** Full affiliation name */
  fullAffiliationName: string;

  /** Affiliation type */
  type: affiliationType;
}


export interface subAffiliationName {
  /** Sub affiliation name */
  subAffiliationName: string;
  affiliationId: string;

}
