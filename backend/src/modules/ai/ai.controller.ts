import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminListQueryDto, paginatedMeta } from '../../common/dto/admin-list-query.dto';
import { AdminJwtAuthGuard } from '../auth/admin-jwt.guard';
import { AiService } from './ai.service';

class ChatDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  guestSessionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  message: string;
}

class PatchAiDto {
  @IsOptional()
  @IsString()
  systemPrompt?: string | null;

  @IsOptional()
  @IsString()
  model?: string | null;

  @IsOptional()
  @IsString()
  apiKey?: string | null;

  @IsOptional()
  @Type(() => Number)
  temperature?: number;

  @IsOptional()
  @Type(() => Number)
  maxTokens?: number;
}

class PatchConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  guestName?: string | null;

  @IsOptional()
  @IsEmail()
  guestEmail?: string | null;
}

@Controller('ai')
export class AiPublicController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  chat(@Body() dto: ChatDto) {
    return this.ai.chat(dto);
  }
}

@Controller('admin/ai')
@UseGuards(AdminJwtAuthGuard)
export class AiAdminController {
  constructor(private readonly ai: AiService) {}

  @Get('conversations')
  async conversations(@Query() query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [items, total] = await this.ai.listConversationsPaginated(page, limit, query.q);
    return { items, meta: paginatedMeta(total, page, limit) };
  }

  @Get('conversations/:id')
  conversation(@Param('id') id: string) {
    return this.ai.getConversation(id);
  }

  @Patch('conversations/:id')
  patchConversation(@Param('id') id: string, @Body() dto: PatchConversationDto) {
    return this.ai.patchConversation(id, dto);
  }

  @Delete('conversations/:id')
  removeConversation(@Param('id') id: string) {
    return this.ai.deleteConversation(id);
  }

  @Get('config')
  config() {
    return this.ai.getConfigForAdmin();
  }

  @Patch('config')
  patch(@Body() dto: PatchAiDto) {
    return this.ai.patchConfig(dto);
  }
}
