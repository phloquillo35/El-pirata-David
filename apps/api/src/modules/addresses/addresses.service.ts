import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDTO, UpdateAddressDTO } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId !== userId) {
      throw new ForbiddenException('You do not own this address');
    }

    return address;
  }

  async create(userId: string, data: CreateAddressDTO) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        ...data,
        userId,
        country: data.country ?? 'AR',
      },
    });
  }

  async update(id: string, userId: string, data: UpdateAddressDTO) {
    await this.findById(id, userId);

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    await this.findById(id, userId);

    return this.prisma.address.delete({ where: { id } });
  }

  async setDefault(id: string, userId: string) {
    await this.findById(id, userId);

    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  }
}
