import { randomUUID } from 'crypto'

type UserRow = {
  id: string
  email: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

type WhereUnique = { id?: string; email?: string; username?: string }
type WhereFirst = { OR?: Array<Partial<UserRow>> }
type CreateArgs = { data: UserRow; select?: Record<string, boolean> }

export class InMemoryPrisma {
  private users: UserRow[] = []

  seed(partial: Omit<UserRow, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<UserRow, 'id' | 'createdAt' | 'updatedAt'>>) {
    this.users.push({
      id: partial.id ?? randomUUID(),
      email: partial.email,
      username: partial.username,
      passwordHash: partial.passwordHash,
      createdAt: partial.createdAt ?? new Date(),
      updatedAt: partial.updatedAt ?? new Date(),
    })
  }

  readonly user = {
    findUnique: async ({ where }: { where: WhereUnique }) => {
      return (
        this.users.find(
          (u) =>
            (where.email && u.email === where.email) ||
            (where.id && u.id === where.id) ||
            (where.username && u.username === where.username),
        ) ?? null
      )
    },

    findFirst: async ({ where }: { where: WhereFirst }) => {
      const conditions = where.OR ?? []
      return (
        this.users.find((u) =>
          conditions.some(
            (c) =>
              (c.email && u.email === c.email) ||
              (c.username && u.username === c.username),
          ),
        ) ?? null
      )
    },

    create: async ({ data, select }: CreateArgs) => {
      const row: UserRow = { ...data, createdAt: new Date(), updatedAt: new Date() }
      this.users.push(row)
      if (!select) return row
      return Object.fromEntries(
        Object.entries(row).filter(([key]) => select[key]),
      )
    },
  }
}
