import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filters and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'isFeatured', required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest', 'oldest'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('brand') brand?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('showInactive') showInactive?: string,
  ) {
    return this.productsService.findAll({
      search,
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      brand,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      showInactive: showInactive === 'true',
    });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  async findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: 'Full text search products' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.search(
      q,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product (Admin)' })
  async create(@Body() data: CreateProductDTO) {
    return this.productsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin)' })
  async update(@Param('id') id: string, @Body() data: UpdateProductDTO) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a product (Admin)' })
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
