import { AiWidgetConfig } from './ai-widget-config.entity';
import { AppointmentMedia } from './appointment-media.entity';
import { Appointment } from './appointment.entity';
import { CaseStudyMedia } from './case-study-media.entity';
import { CaseStudy } from './case-study.entity';
import { Certification } from './certification.entity';
import { ConversationMessage } from './conversation-message.entity';
import { Conversation } from './conversation.entity';
import { EmailConfig } from './email-config.entity';
import { GitRepo } from './git-repo.entity';
import { Media } from './media.entity';
import { SocialLink } from './social-link.entity';
import { ProjectMedia } from './project-media.entity';
import { Project } from './project.entity';
import { TestimonialMedia } from './testimonial-media.entity';
import { Testimonial } from './testimonial.entity';
import { UserSessionPage } from './user-session-page.entity';
import { UserSession } from './user-session.entity';
import { User } from './user.entity';
import { VlogComment } from './vlog-comment.entity';
import { VlogMedia } from './vlog-media.entity';
import { VlogVote } from './vlog-vote.entity';
import { Vlog } from './vlog.entity';

export const ALL_ENTITIES = [
  User,
  Media,
  Project,
  ProjectMedia,
  CaseStudy,
  CaseStudyMedia,
  GitRepo,
  SocialLink,
  Certification,
  Testimonial,
  TestimonialMedia,
  Vlog,
  VlogMedia,
  VlogComment,
  VlogVote,
  Appointment,
  AppointmentMedia,
  Conversation,
  ConversationMessage,
  AiWidgetConfig,
  EmailConfig,
  UserSession,
  UserSessionPage,
];
