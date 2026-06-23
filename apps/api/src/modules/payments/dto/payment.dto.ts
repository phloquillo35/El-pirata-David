import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MercadoPagoWebhookDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  data?: any;

  @ApiPropertyOptional()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resource?: string;
}

export class ConfirmTransferDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  paymentId: string;
}
