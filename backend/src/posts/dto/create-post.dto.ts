import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { EventDateTimePrecision, PostType } from '@prisma/client';
import { LocationDto } from './location.dto';
import { CatProfileDto } from './cat-profile.dto';
import { FoundCareInfoDto } from './found-care-info.dto';

export class CreatePostDto {
  @IsEnum(PostType)
  type!: PostType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsDateString()
  event_datetime!: string;

  @IsEnum(EventDateTimePrecision)
  event_datetime_precision!: EventDateTimePrecision;

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @ValidateNested()
  @Type(() => CatProfileDto)
  cat_profile!: CatProfileDto;

  @IsOptional()
  @IsString()
  chip_number?: string;

  @IsOptional()
  @IsString()
  passport_number?: string;

  @IsOptional()
  @IsBoolean()
  is_neutered?: boolean;

  @IsOptional()
  @IsString()
  health_notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FoundCareInfoDto)
  found_care_info?: FoundCareInfoDto;
}
