import {
    IsString,
    IsOptional,
    IsMongoId,
    IsArray,
    IsEmail,
    ValidateNested,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IntegrationValueDto } from 'src/integrations/dto/integration-value.dto';
import { DatasourceValueDto } from 'src/datasources/dto/datasource-value.dto';

export class CreateWorkspaceDto {
    @IsString()
    @IsNotEmpty()
    workspaceName: string;

    @IsArray()
    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    workspaceType: string[];

    @IsString()
    @IsOptional()
    workspaceIcon?: string;

    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    teamMembers?: string[];

    @IsMongoId()
    industryId: string;

    @IsMongoId()
    userId: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IntegrationValueDto)
    integrationValues?: IntegrationValueDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DatasourceValueDto)
    datasourceValues?: DatasourceValueDto[];
}
