import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LocationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsString()
  @IsNotEmpty()
  location_label!: string;

  @IsNumber()
  @Min(50)
  @IsOptional()
  accuracy_radius_m?: number;
}
