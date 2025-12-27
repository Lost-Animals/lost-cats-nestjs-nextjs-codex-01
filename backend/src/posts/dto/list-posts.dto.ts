import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CatFurLength, PostStatus, PostType } from '@prisma/client';

export class ListPostsDto {
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  page_size?: number;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'nearest' | 'updated';

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  radius_km?: number;

  @IsOptional()
  @IsString()
  location_label?: string;

  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsEnum(CatFurLength)
  fur_length?: CatFurLength;

  @IsOptional()
  @IsString()
  has_chip?: string;

  @IsOptional()
  @IsString()
  date_from?: string;

  @IsOptional()
  @IsString()
  date_to?: string;
}
