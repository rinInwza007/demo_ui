export type roleType = 'User' | 'treasury' | 'Admin' | 'superadmin'

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  userProfile: {
    fullName: string
    phone: string
    role: {
      id: string
      name: string
    }
    affiliation: {
      id: string
      name: string
      type: string
    }
  }
}
