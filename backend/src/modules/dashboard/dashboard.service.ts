import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AiWidgetConfig } from '../../database/entities/ai-widget-config.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { CaseStudy } from '../../database/entities/case-study.entity';
import { Certification } from '../../database/entities/certification.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { EmailConfig } from '../../database/entities/email-config.entity';
import { GitRepo } from '../../database/entities/git-repo.entity';
import { Media } from '../../database/entities/media.entity';
import { Project } from '../../database/entities/project.entity';
import { SocialLink } from '../../database/entities/social-link.entity';
import { Testimonial } from '../../database/entities/testimonial.entity';
import { User } from '../../database/entities/user.entity';
import { Vlog } from '../../database/entities/vlog.entity';
import { VlogComment } from '../../database/entities/vlog-comment.entity';
import { VlogVote } from '../../database/entities/vlog-vote.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly ds: DataSource) {}

  async entityCounts() {
    const r = this.ds.manager;
    const [
      projects,
      caseStudies,
      vlogs,
      appointments,
      certifications,
      testimonials,
      gitRepos,
      socialLinks,
      media,
      conversations,
      users,
      emailConfigs,
      comments,
      votes,
    ] = await Promise.all([
      r.count(Project),
      r.count(CaseStudy),
      r.count(Vlog),
      r.count(Appointment),
      r.count(Certification),
      r.count(Testimonial),
      r.count(GitRepo),
      r.count(SocialLink),
      r.count(Media),
      r.count(Conversation),
      r.count(User),
      r.count(EmailConfig),
      r.count(VlogComment),
      r.count(VlogVote),
    ]);

    const sessionsAgg = await this.ds.query<{ c: string }[]>(`
      SELECT COUNT(*)::int AS c
      FROM (
        SELECT 1
        FROM user_sessions
        GROUP BY visitor_id,
                 to_char(date_trunc('day', started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD')
      ) x
    `);
    const sessionsTotal = Number(sessionsAgg[0]?.c ?? 0);

    const aiConfigs = await r.count(AiWidgetConfig);

    return {
      projects,
      caseStudies,
      vlogs,
      appointments,
      certifications,
      testimonials,
      gitRepos,
      socialLinks,
      media,
      conversations,
      users,
      emailConfigs,
      aiConfigs,
      vlogComments: comments,
      vlogVotes: votes,
      sessionsTotal,
    };
  }
}
