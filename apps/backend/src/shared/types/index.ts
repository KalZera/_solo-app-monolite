export type ID = string

export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type PaginationParams = {
  page: number
  pageSize: number
}

export type Result<T, E = Error> =
  | { data: T }
  | { error: E }

export type Nullable<T> = T | null

export type Maybe<T> = T | undefined
