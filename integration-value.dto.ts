import { IsMongoId, IsString, IsOptional } from 'class-validator';

export class IntegrationValueDto {
    @IsMongoId()
    workspaceId: string;

    @IsMongoId()
    integrationId: string;

    @IsMongoId()
    integrationFieldId: string;

    @IsString()
    @IsOptional()
    webhookUrl: string;
}
