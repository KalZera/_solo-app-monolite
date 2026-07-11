export type ID = string

export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type ApiResponse<T> = {
  data: T
  message?: string
}

export type ApiError = {
  error: string
  message: string
}
