import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VlogComment } from '../../database/entities/vlog-comment.entity';
import { VlogMedia } from '../../database/entities/vlog-media.entity';
import { VlogVote } from '../../database/entities/vlog-vote.entity';
import { Vlog } from '../../database/entities/vlog.entity';

@Injectable()
export class VlogsRepository {
  constructor(
    @InjectRepository(Vlog)
    private readonly vlogs: Repository<Vlog>,
    @InjectRepository(VlogMedia)
    private readonly vm: Repository<VlogMedia>,
    @InjectRepository(VlogComment)
    private readonly vc: Repository<VlogComment>,
    @InjectRepository(VlogVote)
    private readonly vv: Repository<VlogVote>,
  ) {}

  listPublished(limit = 12) {
    return this.vlogs.find({
      where: { published: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      take: limit,
      relations: { mediaItems: { media: true } },
    });
  }

  findPublished(slug: string) {
    return this.vlogs.findOne({
      where: { slug, published: true },
      relations: {
        mediaItems: { media: true },
        comments: true,
      },
    });
  }

  listAdmin() {
    return this.vlogs.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      relations: { mediaItems: { media: true } },
    });
  }

  create(data: Partial<Vlog>) {
    return this.vlogs.save(this.vlogs.create(data));
  }

  async update(id: string, data: Partial<Vlog>) {
    await this.vlogs.update({ id }, data as never);
    const row = await this.vlogs.findOne({
      where: { id },
      relations: { mediaItems: { media: true } },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async delete(id: string) {
    await this.vlogs.delete({ id });
  }

  attach(vlogId: string, mediaId: string, role: string) {
    return this.vm.save(this.vm.create({ vlogId, mediaId, role }));
  }

  addComment(vlogId: string, authorName: string | undefined, body: string) {
    return this.vc.save(this.vc.create({ vlogId, authorName: authorName ?? null, body }));
  }

  async setVote(vlogId: string, visitorKey: string, value: number) {
    const existing = await this.vv.findOne({ where: { vlogId, visitorKey } });
    if (existing) {
      existing.value = value;
      return this.vv.save(existing);
    }
    return this.vv.save(this.vv.create({ vlogId, visitorKey, value }));
  }

  async voteCounts(vlogId: string) {
    const rows = await this.vv.find({ where: { vlogId } });
    let likes = 0;
    let dislikes = 0;
    for (const r of rows) {
      if (r.value === 1) likes++;
      else if (r.value === -1) dislikes++;
    }
    return { likes, dislikes };
  }
}
