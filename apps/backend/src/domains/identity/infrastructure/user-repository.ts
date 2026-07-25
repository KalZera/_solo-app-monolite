import type { PrismaClient } from '@prisma/client'
import type { User, UserRepository } from '../domain/user'
import type { ID } from '../../../shared/types/index'
import { generateId } from '../../../shared/utils/index'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ID): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } })
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.prisma.user.create({ data: { id: generateId(), ...data } })
  }

  async save(id: ID, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data })
  }
}
