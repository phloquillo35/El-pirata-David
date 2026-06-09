import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';
import { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';

function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 8);
}

function generateSlug(name: string): string {
  const base = slugify(name, { lower: true, strict: true });
  return `${base}-${generateRandomSuffix()}`;
}

const productInclude = {
  images: { orderBy: { order: 'asc' as const } },
  specifications: true,
  category: true,
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    isFeatured?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters.brand) {
      where.brand = { equals: filters.brand, mode: 'insensitive' };
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'name_asc':
          orderBy = { name: 'asc' };
          break;
        case 'name_desc':
          orderBy = { name: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: productInclude,
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: string, page = 1, limit = 20) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async create(data: CreateProductDTO) {
    const slug = generateSlug(data.name);

    const { images, specifications, ...productData } = data;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        price: new Prisma.Decimal(productData.price),
        comparePrice: productData.comparePrice ? new Prisma.Decimal(productData.comparePrice) : undefined,
        costPrice: productData.costPrice ? new Prisma.Decimal(productData.costPrice) : undefined,
        weight: productData.weight ? new Prisma.Decimal(productData.weight) : undefined,
        width: productData.width ? new Prisma.Decimal(productData.width) : undefined,
        height: productData.height ? new Prisma.Decimal(productData.height) : undefined,
        depth: productData.depth ? new Prisma.Decimal(productData.depth) : undefined,
        images: images?.length
          ? { createMany: { data: images } }
          : undefined,
        specifications: specifications?.length
          ? { createMany: { data: specifications } }
          : undefined,
      },
      include: productInclude,
    });
  }

  async update(id: string, data: UpdateProductDTO) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const { images, specifications, ...productData } = data;

    const updateData: Prisma.ProductUpdateInput = {
      ...productData,
    };

    if (productData.price) {
      updateData.price = new Prisma.Decimal(productData.price);
    }
    if (productData.comparePrice !== undefined) {
      updateData.comparePrice = productData.comparePrice ? new Prisma.Decimal(productData.comparePrice) : null;
    }
    if (productData.costPrice !== undefined) {
      updateData.costPrice = productData.costPrice ? new Prisma.Decimal(productData.costPrice) : null;
    }
    if (productData.weight !== undefined) {
      updateData.weight = productData.weight ? new Prisma.Decimal(productData.weight) : null;
    }
    if (productData.width !== undefined) {
      updateData.width = productData.width ? new Prisma.Decimal(productData.width) : null;
    }
    if (productData.height !== undefined) {
      updateData.height = productData.height ? new Prisma.Decimal(productData.height) : null;
    }
    if (productData.depth !== undefined) {
      updateData.depth = productData.depth ? new Prisma.Decimal(productData.depth) : null;
    }

    if (images !== undefined) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await this.prisma.productImage.createMany({ data: images.map(img => ({ ...img, productId: id })) });
      }
    }

    if (specifications !== undefined) {
      await this.prisma.productSpecification.deleteMany({ where: { productId: id } });
      if (specifications.length > 0) {
        await this.prisma.productSpecification.createMany({ data: specifications.map(spec => ({ ...spec, productId: id })) });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: productInclude,
    });
  }

  async updateStock(id: string, quantity: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity } },
      include: productInclude,
    });
  }
}
