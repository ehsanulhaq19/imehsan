import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
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
  conversations() {
    return this.ai.listConversations();
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
