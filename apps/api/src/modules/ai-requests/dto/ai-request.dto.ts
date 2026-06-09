import { IsString, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLinkRequestDTO {
  @ApiProperty({ example: 'https://www.mercadolibre.com/product-xyz' })
  @IsString()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ example: 'Customer notes about this request' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReviewAIRequestDTO {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsString()
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ example: 'Approved, creating order' })
  @IsOptional()
  @IsString()
  notes?: string;
}
