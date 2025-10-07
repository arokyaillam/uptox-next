// ============================================
// FILE: app/api/_db.ts
// ============================================

export interface User {
  id: string
  name: string
  encryptedToken: string
  instruments: string[]
  createdAt: string
}

interface Database {
  users: User[]
  lastActiveUserId: string | null
}

// In-memory store (reset on server restart)
export const db: Database = {
  users: [],
  lastActiveUserId: null,
}
