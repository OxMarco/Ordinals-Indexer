import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { StringOption } from 'necord';

export class HelpRequestDto {
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  @StringOption({
    name: 'text',
    description: 'Help text',
    required: true,
  })
  text: string;
}
