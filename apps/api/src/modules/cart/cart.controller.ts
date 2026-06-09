import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @CurrentUser('id') userId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, dto.productId, dto.quantity);
  }

  @Patch('item')
  @ApiOperation({ summary: 'Update item quantity in cart' })
  updateItem(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, dto.productId, dto.quantity);
  }

  @Delete('item/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(
    @CurrentUser('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
