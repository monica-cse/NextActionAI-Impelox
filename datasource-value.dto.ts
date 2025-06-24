// src/datasources/dto/datasource-value.dto.ts

import { IsMongoId, IsObject, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DatasourceFieldValues {
    @IsString()
    customerName: string;

    @IsString()
    contact: string;
}

export class DatasourceValueDto {
    @IsMongoId()
    workspaceId: string;

    @IsMongoId()
    datasourceId: string;

    @IsMongoId()
    datasourceFieldId: string;

    @ValidateNested()
    @Type(() => DatasourceFieldValues)
    datasourceFieldValues: DatasourceFieldValues;
}
