import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ConfigDto {
    @IsString()
    @IsNotEmpty()
    apiVersion: string;

    @IsString()
    @IsNotEmpty()
    baseUrl: string;
}

export class CreateLlmProviderDto {
    @IsString()
    name: string;

    @IsArray()
    @IsString({ each: true })
    status: string[];

    @ValidateNested()
    @Type(() => ConfigDto)
    config: ConfigDto;
}
