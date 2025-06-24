import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateIndustryDto {
    @IsString()
    @IsNotEmpty()
    industryName: string;

    @IsString()
    @IsNotEmpty()
    industryDescription: string;

    @IsBoolean()
    @IsOptional()
    status?: boolean;
}
