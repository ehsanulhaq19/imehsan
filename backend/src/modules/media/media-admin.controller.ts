import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { MediaService } from './media.service';

@Controller('admin/media')
@UseGuards(AdminJwtAuthGuard)
export class MediaAdminController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir =
            process.env.UPLOAD_DIR ||
            join(process.cwd(), 'uploads');
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { id: string } },
  ) {
    if (!file) throw new BadRequestException('file required');
    const publicPath = `/uploads/${file.filename}`;
    const saved = await this.mediaService.saveRecord({
      path: publicPath,
      mimeType: file.mimetype,
      originalName: file.originalname,
      uploadedById: req.user.id,
    });
    return { id: saved.id, url: publicPath, mimeType: saved.mimeType };
  }
}
