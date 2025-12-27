import { IsEnum, IsOptional } from 'class-validator';
import { TriState } from '@prisma/client';

export class FoundCareInfoDto {
  @IsEnum(TriState)
  @IsOptional()
  is_sheltered?: TriState;

  @IsEnum(TriState)
  @IsOptional()
  needs_vet?: TriState;
}
