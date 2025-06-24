import {
    IsArray,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InputFieldDto {
    @IsString()
    fieldId: string;

    @IsString()
    fieldName: string;

    @IsArray()
    @IsString({ each: true })
    fieldType: string[];

    @IsNotEmpty()
    isRequired: boolean;

    @IsNotEmpty()
    isSecret: boolean;
}

export class CreateIntegrationDto {
    @IsString()
    workspaceId: string;

    @IsString()
    name: string;

    @IsArray()
    @IsString({ each: true })
    type: string[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InputFieldDto)
    inputFields: InputFieldDto[];

    @IsArray()
    @IsString({ each: true })
    status: string[];
}
  