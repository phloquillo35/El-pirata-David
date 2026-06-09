import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UploadService, MAX_FILE_SIZE } from './upload.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File | Express.Multer.File[], _metadata: ArgumentMetadata) {
    const files = Array.isArray(value) ? value : [value];

    for (const file of files) {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        );
      }
    }

    return value;
  }
}

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          nullable: true,
        },
      },
    },
  })
  async uploadImage(
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
  ) {
    return this.uploadService.uploadImage(file);
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload multiple images (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  async uploadImages(
    @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[],
  ) {
    return Promise.all(files.map((file) => this.uploadService.uploadImage(file)));
  }
}
