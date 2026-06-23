import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AiRequestsService } from './ai-requests.service';
import { CreateLinkRequestDTO, ReviewAIRequestDTO } from './dto/ai-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, AIRequestStatus } from '@prisma/client';

@ApiTags('AI Requests')
@Controller('ai-requests')
export class AiRequestsController {
  constructor(private readonly aiRequestsService: AiRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new AI request from a product URL' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateLinkRequestDTO,
  ) {
    return this.aiRequestsService.create(userId, body.url, body.notes);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user AI requests' })
  @ApiQuery({ name: 'status', required: false, enum: AIRequestStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findMy(
    @CurrentUser('id') userId: string,
    @Query('status') status?: AIRequestStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aiRequestsService.findMyRequests(userId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list all AI requests' })
  @ApiQuery({ name: 'status', required: false, enum: AIRequestStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(
    @Query('status') status?: AIRequestStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ) {
    return this.aiRequestsService.findAll({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      userId,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI request by ID' })
  async findById(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Param('id') id: string,
  ) {
    const request = await this.aiRequestsService.findById(id);

    if (request.userId !== userId && userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  @Post(':id/analyze')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger AI analysis of the product URL' })
  async analyze(@Param('id') id: string) {
    return this.aiRequestsService.analyzeWithAI(id);
  }

  @Post(':id/alternatives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find product alternatives in local DB' })
  async findAlternatives(@Param('id') id: string) {
    return this.aiRequestsService.findAlternatives(id);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin review AI request' })
  async review(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: ReviewAIRequestDTO,
  ) {
    return this.aiRequestsService.reviewRequest(id, adminId, body.action, body.notes);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete AI request' })
  async delete(@Param('id') id: string) {
    return this.aiRequestsService.delete(id);
  }
}
