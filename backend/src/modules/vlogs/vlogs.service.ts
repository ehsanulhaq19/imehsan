import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Vlog } from '../../database/entities/vlog.entity';
import { VlogsRepository } from './vlogs.repository';

@Injectable()
export class VlogsService {
  constructor(
    private readonly repo: VlogsRepository,
    private readonly config: ConfigService,
  ) {}

  listPublished() {
    return this.repo.listPublished();
  }

  async detail(slug: string) {
    const v = await this.repo.findPublished(slug);
    if (!v) throw new NotFoundException();
    const counts = await this.repo.voteCounts(v.id);
    const baseUrl =
      this.config.get<string>('SITE_PUBLIC_URL') || 'http://localhost:3000';
    const video = v.mediaItems?.find((m) => m.role === 'video');
    const shareUrl = `${baseUrl.replace(/\/$/, '')}/vlogs/${v.slug}`;
    const fileUrl = video?.media?.path
      ? `${baseUrl.replace(/\/$/, '')}${video.media.path}`
      : shareUrl;
    return { ...v, voteSummary: counts, shareUrl, fileUrl };
  }

  listAdmin() {
    return this.repo.listAdmin();
  }

  listAdminPaginated(page: number, limit: number, q?: string) {
    return this.repo.listAdminPaginated(page, limit, q);
  }

  recentActivity(limit: number) {
    return this.repo.recentActivity(limit);
  }

  listCommentsPaginated(page: number, limit: number, q?: string) {
    return this.repo.listCommentsPaginated(page, limit, q);
  }

  listVotesPaginated(page: number, limit: number, q?: string) {
    return this.repo.listVotesPaginated(page, limit, q);
  }

  patchComment(id: string, body: { authorName?: string | null; body?: string }) {
    return this.repo.updateComment(id, body);
  }

  deleteComment(id: string) {
    return this.repo.deleteComment(id);
  }

  deleteVote(id: string) {
    return this.repo.deleteVote(id);
  }

  create(data: Partial<Vlog>) {
    return this.repo.create(data);
  }

  update(id: string, data: Partial<Vlog>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  attach(id: string, mediaId: string, role: string) {
    return this.repo.attach(id, mediaId, role);
  }

  detachMedia(vlogId: string, pivotId: string) {
    return this.repo.detachMedia(vlogId, pivotId);
  }

  async comment(slug: string, authorName: string | undefined, body: string) {
    const v = await this.repo.findPublished(slug);
    if (!v) throw new NotFoundException();
    return this.repo.addComment(v.id, authorName, body);
  }

  async vote(slug: string, visitorKey: string, value: number) {
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Vote must be 1 or -1');
    }
    const v = await this.repo.findPublished(slug);
    if (!v) throw new NotFoundException();
    await this.repo.setVote(v.id, visitorKey, value);
    return this.repo.voteCounts(v.id);
  }
}
