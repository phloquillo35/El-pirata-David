import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, AIRequestStatus } from '@prisma/client';

function detectMarketplace(url: string): string | null {
  const domain = extractDomain(url);
  if (!domain) return null;

  if (domain.includes('mercadolibre')) return 'Mercado Libre';
  if (domain.includes('amazon')) return 'Amazon';
  if (domain.includes('aliexpress')) return 'AliExpress';
  if (domain.includes('ebay')) return 'eBay';

  return domain;
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

const requestInclude = {
  user: {
    select: { id: true, name: true, lastName: true, email: true },
  },
  alternatives: true,
  orders: true,
  adminReviewer: {
    select: { id: true, name: true, lastName: true, email: true },
  },
};

@Injectable()
export class AiRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, url: string, notes?: string) {
    const marketplace = detectMarketplace(url);

    return this.prisma.aIRequest.create({
      data: {
        userId,
        originalUrl: url,
        sourceMarketplace: marketplace,
        status: AIRequestStatus.PENDING,
        adminNotes: notes || null,
      },
      include: requestInclude,
    });
  }

  async findAll(filters: { status?: AIRequestStatus; page?: number; limit?: number; userId?: string }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AIRequestWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [requests, total] = await Promise.all([
      this.prisma.aIRequest.findMany({
        where,
        include: requestInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aIRequest.count({ where }),
    ]);

    return {
      data: requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const request = await this.prisma.aIRequest.findUnique({
      where: { id },
      include: requestInclude,
    });

    if (!request) {
      throw new NotFoundException('AI request not found');
    }

    return request;
  }

  async findMyRequests(userId: string, filters: { status?: AIRequestStatus; page?: number; limit?: number }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AIRequestWhereInput = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.aIRequest.findMany({
        where,
        include: requestInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.aIRequest.count({ where }),
    ]);

    return {
      data: requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async analyzeWithAI(id: string) {
    const request = await this.prisma.aIRequest.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('AI request not found');
    }

    if (request.status !== AIRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be analyzed');
    }

    await this.prisma.aIRequest.update({
      where: { id },
      data: { status: AIRequestStatus.PROCESSING },
    });

    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        throw new BadRequestException('OpenAI API key not configured');
      }

      const domain = extractDomain(request.originalUrl);
      const marketplace = detectMarketplace(request.originalUrl);

      const prompt = `Extract the product information from the following URL: ${request.originalUrl}

The URL is from ${marketplace || 'an unknown marketplace'} (domain: ${domain}).

Please analyze the product listing and return a JSON object with the following fields:
- name: The full product name/title
- brand: The brand name of the product
- model: The model number or code
- category: The category this product belongs to
- price: The listed price as a number (without currency symbol)
- currency: The currency code (e.g., USD, EUR, ARS)
- specifications: An array of objects with name and value fields containing key specifications
- images: An array of image URLs found in the listing

Only return valid JSON, no additional text or explanation.`;

      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);

      await this.prisma.aIRequest.update({
        where: { id },
        data: {
          status: AIRequestStatus.ANALYZED,
          sourceMarketplace: marketplace || request.sourceMarketplace,
          extractedName: parsed.name || null,
          extractedBrand: parsed.brand || null,
          extractedModel: parsed.model || null,
          extractedCategory: parsed.category || null,
          extractedPrice: parsed.price ? new Prisma.Decimal(parsed.price) : null,
          extractedCurrency: parsed.currency || null,
          extractedSpecs: parsed.specifications || Prisma.JsonNull,
          extractedImages: Array.isArray(parsed.images) ? parsed.images : [],
        },
      });

      return this.findById(id);
    } catch (error) {
      await this.prisma.aIRequest.update({
        where: { id },
        data: { status: AIRequestStatus.FAILED },
      });
      throw error;
    }
  }

  async findAlternatives(id: string) {
    const request = await this.prisma.aIRequest.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('AI request not found');
    }

    if (request.status !== AIRequestStatus.ANALYZED && request.status !== AIRequestStatus.PROCESSING) {
      throw new BadRequestException('Request must be analyzed first');
    }

    const searchConditions: Prisma.ProductWhereInput[] = [];

    if (request.extractedName) {
      const keywords = request.extractedName
        .split(' ')
        .filter((w) => w.length > 2)
        .slice(0, 5);
      if (keywords.length > 0) {
        searchConditions.push({
          OR: keywords.map((keyword) => ({
            name: { contains: keyword, mode: 'insensitive' as Prisma.QueryMode },
          })),
        });
      }
    }

    if (request.extractedBrand) {
      searchConditions.push({
        brand: { contains: request.extractedBrand, mode: 'insensitive' as Prisma.QueryMode },
      });
    }

    if (request.extractedCategory) {
      searchConditions.push({
        category: { name: { contains: request.extractedCategory, mode: 'insensitive' as Prisma.QueryMode } },
      });
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      OR: searchConditions.length > 0 ? searchConditions : undefined,
    };

    if (!where.OR) {
      return this.findById(id);
    }

    const products = await this.prisma.product.findMany({
      where,
      take: 10,
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
    });

    const alternatives = products.map((product) => {
      let confidence = 0.5;

      if (request.extractedBrand && product.brand) {
        if (product.brand.toLowerCase() === request.extractedBrand.toLowerCase()) {
          confidence += 0.25;
        }
      }

      if (request.extractedName && product.name) {
        const nameWords = request.extractedName.toLowerCase().split(' ');
        const productWords = product.name.toLowerCase().split(' ');
        const common = nameWords.filter((w) => productWords.includes(w));
        confidence += (common.length / Math.max(nameWords.length, productWords.length)) * 0.25;
      }

      if (request.extractedPrice && product.price) {
        const priceDiff = Math.abs(Number(product.price) - Number(request.extractedPrice));
        const maxPrice = Math.max(Number(product.price), Number(request.extractedPrice));
        if (maxPrice > 0 && priceDiff / maxPrice < 0.3) {
          confidence += 0.15;
        }
      }

      return {
        requestId: id,
        name: product.name,
        brand: product.brand || null,
        model: product.model || null,
        price: product.price,
        currency: 'ARS',
        supplier: 'El Pirata David',
        supplierUrl: null,
        confidence: Math.min(confidence, 1),
        notes: null,
      };
    });

    await this.prisma.productAlternative.deleteMany({ where: { requestId: id } });

    if (alternatives.length > 0) {
      await this.prisma.productAlternative.createMany({ data: alternatives });
    }

    await this.prisma.aIRequest.update({
      where: { id },
      data: { status: AIRequestStatus.ALTERNATIVES_FOUND },
    });

    return this.findById(id);
  }

  async reviewRequest(id: string, adminId: string, action: 'approve' | 'reject', notes?: string) {
    const request = await this.prisma.aIRequest.findUnique({
      where: { id },
      include: { alternatives: true },
    });

    if (!request) {
      throw new NotFoundException('AI request not found');
    }

    if (request.status !== AIRequestStatus.ALTERNATIVES_FOUND && request.status !== AIRequestStatus.ANALYZED) {
      throw new BadRequestException('Request must be analyzed with alternatives before review');
    }

    await this.prisma.aIRequestReview.create({
      data: {
        requestId: id,
        reviewerId: adminId,
        action,
        comment: notes || null,
      },
    });

    if (action === 'approve') {
      const selectedAlternative = request.alternatives.find((alt) => alt.isSelected) || request.alternatives[0];

      const orderNumber = 'EPD-LINK-' + Date.now().toString(36).toUpperCase();
      const subtotal = selectedAlternative?.price || request.extractedPrice || new Prisma.Decimal(0);
      const shippingCost = new Prisma.Decimal(0);
      const tax = new Prisma.Decimal(0);

      await this.prisma.order.create({
        data: {
          orderNumber,
          userId: request.userId,
          type: 'LINK_REQUEST',
          status: 'CONFIRMED',
          aiRequestId: id,
          subtotal,
          shippingCost,
          tax,
          total: subtotal.plus(shippingCost).plus(tax),
          currency: request.extractedCurrency || 'ARS',
          notes: `Order from AI request: ${request.originalUrl}`,
          items: {
            create: {
              name: selectedAlternative?.name || request.extractedName || 'Product',
              sku: 'AI-REQUEST',
              quantity: 1,
              unitPrice: subtotal,
              totalPrice: subtotal,
            },
          },
        },
      });
    }

    const newStatus = action === 'approve' ? AIRequestStatus.COMPLETED : AIRequestStatus.REJECTED;

    await this.prisma.aIRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNotes: notes || null,
        adminReviewedById: adminId,
        reviewedAt: new Date(),
      },
    });

    return this.findById(id);
  }

  async delete(id: string) {
    const request = await this.prisma.aIRequest.findUnique({ where: { id } });

    if (!request) {
      throw new NotFoundException('AI request not found');
    }

    await this.prisma.aIRequest.delete({ where: { id } });

    return { message: 'AI request deleted successfully' };
  }
}
