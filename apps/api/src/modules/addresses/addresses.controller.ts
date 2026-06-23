import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDTO, UpdateAddressDTO } from './dto/address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.addressesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  async findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.addressesService.findById(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() data: CreateAddressDTO,
  ) {
    return this.addressesService.create(userId, data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: UpdateAddressDTO,
  ) {
    return this.addressesService.update(id, userId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.addressesService.delete(id, userId);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefault(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.addressesService.setDefault(id, userId);
  }
}
