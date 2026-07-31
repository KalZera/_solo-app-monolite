import type { AvatarStorage } from '../domain/avatar-storage'

export class InMemoryAvatarStorage implements AvatarStorage {
  public readonly uploads: Array<{ key: string; contentType: string }> = []

  async upload (key: string, _body: Buffer, contentType: string): Promise<string> {
    this.uploads.push({ key, contentType })
    return `https://fake-bucket.local/${key}`
  }
}
