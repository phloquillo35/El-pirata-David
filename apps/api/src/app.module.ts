import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as path from 'path';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AiRequestsModule } from './modules/ai-requests/ai-requests.module';
import { HealthModule } from './modules/health/health.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', path.resolve(__dirname, '../../.env')],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CartModule,
    PaymentsModule,
    AddressesModule,
    AiRequestsModule,
    HealthModule,
    UploadModule,
    AdminModule,
  ],
})
export class AppModule {}
