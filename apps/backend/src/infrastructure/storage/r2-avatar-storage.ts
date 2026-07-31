import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { AvatarStorage } from '../../domains/character/domain/avatar-storage'

export class R2AvatarStorage implements AvatarStorage {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly publicUrl: string

  constructor () {
    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    const bucket = process.env.R2_BUCKET_NAME
    const publicUrl = process.env.R2_PUBLIC_URL

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      throw new Error(
        'R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, ' +
        'R2_BUCKET_NAME and R2_PUBLIC_URL env variables.'
      )
    }

    this.bucket = bucket
    this.publicUrl = publicUrl.replace(/\/$/, '')
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async upload (key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }))

    return `${this.publicUrl}/${key}`
  }
}
