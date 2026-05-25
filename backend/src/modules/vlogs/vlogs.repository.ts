import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, Repository } from 'typeorm';
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

  async listPublishedPaginated(page: number, limit: number, excludeSlug?: string) {
    const skip = (page - 1) * limit;
    const ex = excludeSlug?.trim();
    const where = ex ? { published: true, slug: Not(ex) } : { published: true };
    const total = await this.vlogs.count({ where });
    const items = await this.vlogs.find({
      where,
      order: { sortOrder: 'DESC', createdAt: 'DESC' },
      relations: { mediaItems: { media: true } },
      skip,
      take: limit,
    });
    return { items, total };
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

  async listAdminPaginated(page: number, limit: number, q?: string) {
    const skip = (page - 1) * limit;
    const qb = this.vlogs
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.mediaItems', 'mi')
      .leftJoinAndSelect('mi.media', 'm')
      .orderBy('v.sortOrder', 'ASC')
      .addOrderBy('v.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('v.slug ILIKE :s', { s }).orWhere('v.heading ILIKE :s', { s });
        }),
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  findById(id: string) {
    return this.vlogs.findOne({ where: { id } });
  }

  async listCommentsPaginated(
    page: number,
    limit: number,
    q?: string,
    vlogId?: string,
  ) {
    const skip = (page - 1) * limit;
    const qb = this.vc
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.vlog', 'v')
      .orderBy('c.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (vlogId) {
      qb.andWhere('c.vlog_id = :vlogId', { vlogId });
    }
    if (q?.trim()) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('c.body ILIKE :s', { s: `%${q.trim()}%` }).orWhere(
            'c.authorName ILIKE :s',
            { s: `%${q.trim()}%` },
          );
          if (!vlogId) {
            w.orWhere('v.slug ILIKE :sv', {
              sv: `%${q.trim()}%`,
            }).orWhere('v.heading ILIKE :vh', {
              vh: `%${q.trim()}%`,
            });
          }
        }),
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async listVotesPaginated(page: number, limit: number, q?: string, vlogId?: string) {
    const skip = (page - 1) * limit;
    const qb = this.vv
      .createQueryBuilder('vo')
      .leftJoinAndSelect('vo.vlog', 'v')
      .orderBy('vo.createdAt', 'DESC')
      .skip(skip)
      .take(limit);
    if (vlogId) {
      qb.andWhere('vo.vlog_id = :vlogId', { vlogId });
    }
    if (q?.trim()) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('vo.visitor_key ILIKE :vk', {
            vk: `%${q.trim()}%`,
          });
          if (!vlogId) {
            w.orWhere('v.slug ILIKE :s', {
              s: `%${q.trim()}%`,
            }).orWhere('v.heading ILIKE :vh', {
              vh: `%${q.trim()}%`,
            });
          }
        }),
      );
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /** Per-vlog aggregates for admin list rows (two batched queries). */
  async getEngagementCountsByVlogIds(
    ids: string[],
  ): Promise<Map<string, { comments: number; likes: number; dislikes: number }>> {
    type Row = { comments: number; likes: number; dislikes: number };
    const base = (): Row => ({ comments: 0, likes: 0, dislikes: 0 });
    const map = new Map<string, Row>();
    for (const id of ids) map.set(id, base());
    if (!ids.length) return map;

    const cRows = await this.vc
      .createQueryBuilder('c')
      .select('c.vlog_id', 'vlogId')
      .addSelect('COUNT(*)::int', 'cnt')
      .where('c.vlog_id IN (:...ids)', { ids })
      .groupBy('c.vlog_id')
      .getRawMany<{ vlogId: string; cnt: number }>();

    for (const r of cRows) {
      const row = map.get(String(r.vlogId));
      if (row) row.comments = Number(r.cnt);
    }

    const vRows = await this.vv
      .createQueryBuilder('vo')
      .select('vo.vlog_id', 'vlogId')
      .addSelect('COALESCE(SUM(CASE WHEN vo.value = 1 THEN 1 ELSE 0 END), 0)::int', 'likes')
      .addSelect('COALESCE(SUM(CASE WHEN vo.value = -1 THEN 1 ELSE 0 END), 0)::int', 'dislikes')
      .where('vo.vlog_id IN (:...ids)', { ids })
      .groupBy('vo.vlog_id')
      .getRawMany<{ vlogId: string; likes: number; dislikes: number }>();

    for (const r of vRows) {
      const row = map.get(String(r.vlogId));
      if (row) {
        row.likes = Number(r.likes);
        row.dislikes = Number(r.dislikes);
      }
    }

    return map;
  }

  async recentActivity(limit: number) {
    const comments = await this.vc.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: { vlog: true },
    });
    const votes = await this.vv.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: { vlog: true },
    });
    type Row =
      | {
          kind: 'comment';
          at: Date;
          id: string;
          vlogSlug: string;
          vlogHeading: string;
          authorName: string | null;
          body: string;
        }
      | {
          kind: 'vote';
          at: Date;
          id: string;
          vlogSlug: string;
          vlogHeading: string;
          value: number;
          visitorKey: string;
        };
    const rows: Row[] = [];
    for (const c of comments) {
      rows.push({
        kind: 'comment',
        at: c.createdAt,
        id: c.id,
        vlogSlug: c.vlog?.slug ?? '',
        vlogHeading: c.vlog?.heading ?? '',
        authorName: c.authorName,
        body: c.body,
      });
    }
    for (const vo of votes) {
      rows.push({
        kind: 'vote',
        at: vo.createdAt,
        id: vo.id,
        vlogSlug: vo.vlog?.slug ?? '',
        vlogHeading: vo.vlog?.heading ?? '',
        value: vo.value,
        visitorKey: vo.visitorKey,
      });
    }
    rows.sort((a, b) => b.at.getTime() - a.at.getTime());
    return rows.slice(0, limit);
  }

  async updateComment(id: string, body: Partial<{ authorName: string | null; body: string }>) {
    await this.vc.update({ id }, body as never);
    const row = await this.vc.findOne({ where: { id }, relations: { vlog: true } });
    if (!row) throw new NotFoundException();
    return row;
  }

  async deleteComment(id: string) {
    await this.vc.delete({ id });
  }

  async deleteVote(id: string) {
    await this.vv.delete({ id });
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

  async detachMedia(vlogId: string, pivotId: string) {
    const r = await this.vm.delete({ id: pivotId, vlogId });
    if (!r.affected) throw new NotFoundException();
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
