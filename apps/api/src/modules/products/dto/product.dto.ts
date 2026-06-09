import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max, IsArray, ValidateNested, ArrayMinSize, MinLength, MaxLength, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageDTO {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'Product image' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class ProductSpecificationDTO {
  @ApiProperty({ example: 'Weight' })
  @IsString()
  name: string;

  @ApiProperty({ example: '10 kg' })
  @IsString()
  value: string;
}

export class CreateProductDTO {
  @ApiProperty({ example: 'Smartphone XYZ' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'A high-end smartphone with amazing features' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Samsung' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Galaxy S24' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'SMP-001' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '8806090888888' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 1299.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depth?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'SEO Title' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'SEO Description' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;

  @ApiPropertyOptional({ type: [ProductImageDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDTO)
  images?: ProductImageDTO[];

  @ApiPropertyOptional({ type: [ProductSpecificationDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDTO)
  specifications?: ProductSpecificationDTO[];
}

export class UpdateProductDTO {
  @ApiPropertyOptional({ example: 'Smartphone XYZ' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'A high-end smartphone with amazing features' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Samsung' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Galaxy S24' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'SMP-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '8806090888888' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 999.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 1299.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ example: 600 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  depth?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 'uuid-category-id' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'SEO Title' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'SEO Description' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;

  @ApiPropertyOptional({ type: [ProductImageDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDTO)
  images?: ProductImageDTO[];

  @ApiPropertyOptional({ type: [ProductSpecificationDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDTO)
  specifications?: ProductSpecificationDTO[];
}
