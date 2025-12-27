import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CatAgeGroup, CatFurLength, CatPattern, CatSex, CatSize } from '@prisma/client';

export class CatProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(CatSex)
  @IsOptional()
  sex?: CatSex;

  @IsEnum(CatAgeGroup)
  @IsOptional()
  age_group?: CatAgeGroup;

  @IsEnum(CatSize)
  @IsOptional()
  size?: CatSize;

  @IsEnum(CatFurLength)
  @IsOptional()
  fur_length?: CatFurLength;

  @IsString()
  primary_color!: string;

  @IsOptional()
  @IsString()
  secondary_color?: string;

  @IsEnum(CatPattern)
  @IsOptional()
  pattern?: CatPattern;

  @IsOptional()
  @IsString()
  distinctive_marks?: string;
}
