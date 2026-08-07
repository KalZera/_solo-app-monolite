export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  username: string
  password: string
}

/** The backend only ever returns the short-lived access token in the body. */
export interface AuthTokens {
  access_token: string
}

export interface RegisteredHunter {
  id: string
  email: string
  username: string
  createdAt: string
}
