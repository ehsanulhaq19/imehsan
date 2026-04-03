import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../database/entities/media.entity';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(Media)
    private readonly repo: Repository<Media>,
  ) {}

  create(data: Partial<Media>) {
    return this.repo.save(this.repo.create(data));
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }
}
