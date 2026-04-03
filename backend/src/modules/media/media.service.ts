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

  findOne(id: string) {
    return this.mediaRepository.findOne(id);
  }
}
