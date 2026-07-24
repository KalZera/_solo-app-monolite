import type { ID } from '../../../shared/types/index'

export interface User {
  id: ID
  email: string
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface UserRepository {
  findById(id: ID): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>
  save(id: ID, data: Partial<User>): Promise<User>
}
