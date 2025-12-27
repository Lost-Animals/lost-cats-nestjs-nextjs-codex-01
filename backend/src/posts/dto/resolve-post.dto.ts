import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class ResolvePostDto {
  @IsOptional()
  @IsBoolean()
  was_reunited?: boolean;

  @IsOptional()
  @IsDateString()
  resolved_at?: string;
}
