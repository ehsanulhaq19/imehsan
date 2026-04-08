import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialMedia } from '../../database/entities/testimonial-media.entity';
import { Testimonial } from '../../database/entities/testimonial.entity';
import { AuthModule } from '../auth/auth.module';
import {
  TestimonialsAdminController,
  TestimonialsPublicController,
} from './testimonials.controller';
import { TestimonialsRepository } from './testimonials.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial, TestimonialMedia]),
    AuthModule,
  ],
  controllers: [TestimonialsPublicController, TestimonialsAdminController],
  providers: [TestimonialsRepository],
})
export class TestimonialsModule {}
