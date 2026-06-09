import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import slugify from 'slugify';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dto/category.dto';

const categoryInclude = {
  children: {
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { order: 'asc' as const },
  },
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: categoryInclude,
      orderBy: { order: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: categoryInclude,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(data: CreateCategoryDTO) {
    const slug = slugify(data.name, { lower: true, strict: true });

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('A category with this slug already exists');
    }

    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        ...data,
        slug,
      },
      include: categoryInclude,
    });
  }

  async update(id: string, data: UpdateCategoryDTO) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
      if (data.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
      include: categoryInclude,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: { products: { take: 1 }, children: { take: 1 } },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (existing.products.length > 0) {
      throw new BadRequestException('Cannot delete category with attached products');
    }

    if (existing.children.length > 0) {
      throw new BadRequestException('Cannot delete category with child categories');
    }

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
      include: categoryInclude,
    });
  }
}
