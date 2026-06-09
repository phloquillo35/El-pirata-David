import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiRequestsController } from './ai-requests.controller';
import { AiRequestsService } from './ai-requests.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiRequestsController],
  providers: [AiRequestsService],
  exports: [AiRequestsService],
})
export class AiRequestsModule {}
