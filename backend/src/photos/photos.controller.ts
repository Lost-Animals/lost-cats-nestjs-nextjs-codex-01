import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';

const maxMb = Number(process.env.PHOTO_MAX_MB || 10);
const allowedMime = (process.env.PHOTO_ALLOWED_MIME || 'image/jpeg,image/png,image/webp').split(',');

@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('posts/:id/photos')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: maxMb * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!allowedMime.includes(file.mimetype)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      }
    })
  )
  upload(
    @Param('id') postId: string,
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.photosService.upload(postId, user.id, file);
  }

  @Delete('photos/:photo_id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('photo_id') photoId: string, @CurrentUser() user: { id: string }) {
    return this.photosService.delete(photoId, user.id);
  }

  @Patch('posts/:id/photos/reorder')
  @UseGuards(AuthGuard('jwt'))
  reorder(
    @Param('id') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ReorderPhotosDto
  ) {
    return this.photosService.reorder(postId, user.id, dto.photo_ids);
  }
}
