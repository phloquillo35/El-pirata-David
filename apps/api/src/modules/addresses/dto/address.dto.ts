import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class CreateAddressDTO {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  alias: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ example: '+5491155551234' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Av. Mariscal López' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  street: string;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  number?: string;

  @ApiPropertyOptional({ example: 'Edificio Torres, piso 5' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  complement?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'Buenos Aires' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'Central' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state: string;

  @ApiPropertyOptional({ example: '1001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ example: 'AR' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  country?: string = 'AR';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDTO extends PartialType(CreateAddressDTO) {}
