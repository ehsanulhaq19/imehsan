import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.repository';

@Injectable()
export class MediaService {
  constructor(private readonly mediaRepository: MediaRepository) {}

  saveRecord(payload: {
    path: string;
    mimeType: string;
    originalName: string;
    uploadedById?: string | null;
  }) {
    return this.mediaRepository.create({
      path: payload.path,
      mimeType: payload.mimeType,
      originalName: payload.originalName,
      uploadedById: payload.uploadedById ?? null,
      metadata: {},
    });
  }

  deleteOne(id: string) {
    return this.mediaRepository.deleteOne(id);
  }

  listPaginated(page: number, limit: number, q?: string) {
    return this.mediaRepository.listPaginated(page, limit, q);
  }

  findOne(id: string) {
    return this.mediaRepository.findOne(id);
  }
}
