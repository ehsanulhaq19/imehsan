import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Media } from './media.entity';
import { Testimonial } from './testimonial.entity';

@Entity('testimonial_media')
export class TestimonialMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Testimonial, (t) => t.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testimonial_id' })
  testimonial: Testimonial;

  @Column({ name: 'testimonial_id', type: 'uuid' })
  testimonialId: string;

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @Column({ name: 'media_id', type: 'uuid' })
  mediaId: string;

  @Column({ type: 'varchar', length: 32, default: 'image' })
  role: string;
}
