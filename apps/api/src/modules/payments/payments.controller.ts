import { Controller, Get, Post, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { MercadoPagoWebhookDTO, ConfirmTransferDTO } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mercado-pago/create/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create MercadoPago payment preference' })
  async createMercadoPagoPreference(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.createMercadoPagoPreference(orderId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'MercadoPago webhook endpoint' })
  async webhook(@Body() data: MercadoPagoWebhookDTO) {
    return this.paymentsService.processMercadoPagoWebhook(data);
  }

  @Post('bank-transfer/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create bank transfer payment' })
  async createBankTransfer(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.createBankTransfer(orderId);
  }

  @Post('confirm-transfer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin confirm bank transfer payment' })
  async confirmBankTransfer(@Body() data: ConfirmTransferDTO) {
    return this.paymentsService.confirmBankTransfer(data.paymentId);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by order ID' })
  async getPaymentByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }
}
