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

/** The authenticated Hunter as returned by GET /identity/me. */
export interface Me {
  id: string
  email: string
  username: string
  /** Whether the Hunter has already seen the "how to use the app" tutorial sheet. */
  isCompleteTutorial: boolean
}
