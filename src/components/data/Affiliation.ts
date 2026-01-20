// src/components/data/Affiliation.ts
import { Affiliation } from '@/types/affiliation';


export const defaultAffiliation: Affiliation [] = [
  {
    id: 'MED',
    name: 'คณะแพทยศาสตร์',
    type: 'คณะ',
    parentId: null,
  },
  {
    id: 'MED-HOSP',
    name: 'โรงพยาบาลมหาวิทยาลัยพะเยา',
    type: 'ศูนย์',
    parentId: 'MED',
  },

  {
    id: 'DEN',
    name: 'คณะทันตแพทยศาสตร์',
    type: 'คณะ',
    parentId: null,
  },
  {
    id: 'DEN-HOSP',
    name: 'โรงพยาบาลทันตกรรมมหาวิทยาลัยพะเยา',
    type: 'ศูนย์',
    parentId: 'DEN',
  },

  {
    id: 'NUR',
    name: 'คณะพยาบาลศาสตร์',
    type: 'คณะ',
    parentId: null,
  },
  {
    id: 'NUR-CHILD',
    name: 'ศูนย์พัฒนาเด็กเล็ก',
    type: 'ศูนย์',
    parentId: 'NUR',
  },



  {
    id: 'ENE',
    name: 'คณะพลังงานและสิ่งแวดล้อม',
    type: 'คณะ',
    parentId: null,
  },
    {
    id: 'ENE-RES',
    name: 'ศูนย์วิจัยพลังงานทดแทนและสิ่งแวดล้อม',
    type: 'ศูนย์',
    parentId: 'ENE',
  },
  {
    id: 'ENE-RES-TEST',
    name: 'หน่วยปฏิบัติการทดสอบทางสิ่งแวดล้อม',
    type: 'อื่นๆ',
    parentId: 'ENE-RES',
  },
  {
    id: 'ENE-RES-CARBON',
    name: 'หน่วยรับรองการจัดการก๊าซเรือนกระจก',
    type: 'อื่นๆ',
    parentId: 'ENE-RES',
  },

]
