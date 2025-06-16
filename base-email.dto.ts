import { IsEmail, IsNotEmpty } from 'class-validator';

export class BaseEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
