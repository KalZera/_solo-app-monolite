import { randomUUID } from 'crypto'

type UserRow = {
  id: string
  email: string
  username: string
  passwordHash: string
  isCompleteTutorial: boolean
  createdAt: Date
  updatedAt: Date
}

type WhereUnique = { id?: string; email?: string; username?: string }
type WhereFirst = { OR?: Array<Partial<UserRow>> }
// `isCompleteTutorial` is optional here because callers (e.g. RegisterUserUseCase) rely on the
// database default — mirror that default in `create` below.
type CreateArgs = {
  data: Omit<UserRow, 'isCompleteTutorial'> & Partial<Pick<UserRow, 'isCompleteTutorial'>>
  select?: Record<string, boolean>
}
type UpdateArgs = {
  where: WhereUnique
  data: Partial<UserRow>
  select?: Record<string, boolean>
}

export class InMemoryPrisma {
  private users: UserRow[] = []

  seed (
    partial: Omit<UserRow, 'id' | 'isCompleteTutorial' | 'createdAt' | 'updatedAt'> &
      Partial<Pick<UserRow, 'id' | 'isCompleteTutorial' | 'createdAt' | 'updatedAt'>>
  ) {
    this.users.push({
      id: partial.id ?? randomUUID(),
      email: partial.email,
      username: partial.username,
      passwordHash: partial.passwordHash,
      isCompleteTutorial: partial.isCompleteTutorial ?? false,
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
            (where.username && u.username === where.username)
        ) ?? null
      )
    },

    findFirst: async ({ where }: { where: WhereFirst }) => {
      const conditions = where.OR ?? []
      return (
        this.users.find((u) =>
          conditions.some((c) => (c.email && u.email === c.email) || (c.username && u.username === c.username))
        ) ?? null
      )
    },

    create: async ({ data, select }: CreateArgs) => {
      const row: UserRow = {
        ...data,
        isCompleteTutorial: data.isCompleteTutorial ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.users.push(row)
      if (!select) return row
      return Object.fromEntries(Object.entries(row).filter(([key]) => select[key]))
    },

    update: async ({ where, data, select }: UpdateArgs) => {
      const index = this.users.findIndex(
        (u) =>
          (where.id && u.id === where.id) ||
          (where.email && u.email === where.email) ||
          (where.username && u.username === where.username)
      )

      if (index === -1) {
        throw new Error('Record to update not found')
      }

      const row: UserRow = { ...this.users[index], ...data, updatedAt: new Date() }
      this.users[index] = row
      if (!select) return row
      return Object.fromEntries(Object.entries(row).filter(([key]) => select[key]))
    },
  }
}
