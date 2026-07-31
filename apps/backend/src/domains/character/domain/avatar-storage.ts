export interface AvatarStorage {
  upload(key: string, body: Buffer, contentType: string): Promise<string>
}
