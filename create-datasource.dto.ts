import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InputFieldDto {
    @IsString()
    @IsNotEmpty()
    datasourceLabelName: string;

    @IsBoolean()
    isRequired: boolean;

    @IsArray()
    @IsString({ each: true })
    datasourceInputType: string[];
}

export class CreateDatasourceDto {
    @IsString()
    @IsNotEmpty()
    datasourceName: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InputFieldDto)
    inputFields: InputFieldDto[];
}
