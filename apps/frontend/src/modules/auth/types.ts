export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface RegisterInput {
  email: string
  username: string
  password: string
}

export interface RegisterResponse {
  id: string
  email: string
  username: string
  createdAt: string
}
