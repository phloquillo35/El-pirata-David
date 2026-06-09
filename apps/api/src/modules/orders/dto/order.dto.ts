import { IsString, IsOptional, IsArray, ValidateNested, ArrayMinSize, Min, MinLength as MinLen, MaxLength as MaxLen, IsUUID, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class CreateOrderItemDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDTO {
  @ApiProperty({ type: [CreateOrderItemDTO] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDTO)
  items: CreateOrderItemDTO[];

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  shippingAddressId: string;

  @ApiPropertyOptional({ example: 'Leave at the door' })
  @IsOptional()
  @IsString()
  @MaxLen(500)
  notes?: string;
}

export class UpdateOrderStatusDTO {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: 'Order is being processed' })
  @IsString()
  @MinLen(5)
  @MaxLen(500)
  description: string;
}
