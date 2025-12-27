import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

@Injectable()
export class GcsService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const projectId = configService.get<string>('GCS_PROJECT_ID');
    const clientEmail = configService.get<string>('GCS_CLIENT_EMAIL');
    const privateKey = configService.get<string>('GCS_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    this.storage = clientEmail && privateKey
      ? new Storage({
          projectId,
          credentials: {
            client_email: clientEmail,
            private_key: privateKey
          }
        })
      : new Storage({ projectId });
    this.bucketName = configService.get<string>('GCS_BUCKET') || 'lostcats-photos';
  }

  async upload(buffer: Buffer, contentType: string, objectKey?: string) {
    const key = objectKey ?? `posts/${randomUUID()}`;
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(key);

    await file.save(buffer, {
      metadata: { contentType },
      resumable: false
    });

    return key;
  }

  async getSignedUrl(objectKey: string) {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectKey);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000
    });

    return url;
  }

  async deleteObject(objectKey: string) {
    const bucket = this.storage.bucket(this.bucketName);
    await bucket.file(objectKey).delete({ ignoreNotFound: true });
  }
}
