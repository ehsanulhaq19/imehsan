import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialMedia } from '../../database/entities/testimonial-media.entity';
import { Testimonial } from '../../database/entities/testimonial.entity';

@Injectable()
export class TestimonialsRepository {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repo: Repository<Testimonial>,
    @InjectRepository(TestimonialMedia)
    private readonly pivot: Repository<TestimonialMedia>,
  ) {}

  listApproved() {
    return this.repo.find({
      where: { approved: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: { images: { media: true } },
    });
  }

  listAdmin() {
    return this.repo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: { images: { media: true } },
    });
  }

  create(data: Partial<Testimonial>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Testimonial>) {
    await this.repo.update({ id }, data as never);
    const row = await this.repo.findOne({
      where: { id },
      relations: { images: { media: true } },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.repo.delete({ id });
  }

  attach(testimonialId: string, mediaId: string, role = 'image') {
    return this.pivot.save(this.pivot.create({ testimonialId, mediaId, role }));
  }
}
