import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly cloudinaryEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    this.cloudinaryEnabled = !!cloudName;
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'products',
  ): Promise<{ url: string; publicId: string }> {
    this.validateFile(file);

    if (this.cloudinaryEnabled) {
      return this.uploadToCloudinary(file, folder);
    }

    return this.uploadToLocal(file, folder);
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('publicId is required');
    }

    if (this.cloudinaryEnabled) {
      await this.deleteFromCloudinary(publicId);
      return;
    }

    await this.deleteFromLocal(publicId);
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const url = `/uploads/${folder}/${filename}`;
    return { url, publicId: url };
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    const cloudinary = await import('cloudinary').then((m) => m.v2);

    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);
      stream.pipe(uploadStream);
    });
  }

  private async deleteFromCloudinary(publicId: string): Promise<void> {
    const cloudinary = await import('cloudinary').then((m) => m.v2);

    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    await cloudinary.uploader.destroy(publicId);
  }

  private async deleteFromLocal(publicId: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), publicId);
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`File not found for deletion: ${publicId}`);
        return;
      }
      throw error;
    }
  }
}
