import { randomUUID } from 'crypto'

export const generateId = (): string => randomUUID()

export const paginate = <T>(items: T[], page: number, pageSize: number) => ({
  data: items.slice((page - 1) * pageSize, page * pageSize),
  total: items.length,
  page,
  pageSize,
})
