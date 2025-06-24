import {
    IsString,
    IsOptional,
    IsArray,
    IsMongoId,
    IsNumber,
    IsObject,
    ValidateNested,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ActionDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    category: string;
}

export class CreateTemplateDto {
    @IsMongoId()
    @IsNotEmpty()
    workspaceId: string;

    @IsString()
    @IsNotEmpty()
    templateName: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    templateType?: string;

    @IsOptional()
    @IsNumber()
    version?: number;

    @IsOptional()
    @IsMongoId()
    referencedTemplate?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ActionDto)
    actions?: ActionDto[];

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    categoryIds?: string[];

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
