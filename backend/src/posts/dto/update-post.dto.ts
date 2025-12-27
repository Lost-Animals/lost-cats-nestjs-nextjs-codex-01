import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { EventDateTimePrecision } from '@prisma/client';
import { LocationDto } from './location.dto';
import { CatProfileDto } from './cat-profile.dto';
import { FoundCareInfoDto } from './found-care-info.dto';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  event_datetime?: string;

  @IsOptional()
  @IsEnum(EventDateTimePrecision)
  event_datetime_precision?: EventDateTimePrecision;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CatProfileDto)
  cat_profile?: CatProfileDto;

  @IsOptional()
  @IsString()
  chip_number?: string | null;

  @IsOptional()
  @IsString()
  passport_number?: string | null;

  @IsOptional()
  @IsBoolean()
  is_neutered?: boolean | null;

  @IsOptional()
  @IsString()
  health_notes?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => FoundCareInfoDto)
  found_care_info?: FoundCareInfoDto | null;
}
