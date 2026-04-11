import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiWidgetConfig } from '../../database/entities/ai-widget-config.entity';
import { ConversationMessage } from '../../database/entities/conversation-message.entity';
import { Conversation } from '../../database/entities/conversation.entity';
import { AuthModule } from '../auth/auth.module';
import { AiAdminController, AiPublicController } from './ai.controller';
import { AiRepository } from './ai.repository';
import { AiService } from './ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiWidgetConfig,
      Conversation,
      ConversationMessage,
    ]),
    AuthModule,
  ],
  controllers: [AiPublicController, AiAdminController],
  providers: [AiRepository, AiService],
  exports: [AiService],
})
export class AiModule {}
