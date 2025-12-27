import { IsString, MaxLength } from 'class-validator';

export class ContactPostDto {
  @IsString()
  @MaxLength(2000)
  message!: string;
}
