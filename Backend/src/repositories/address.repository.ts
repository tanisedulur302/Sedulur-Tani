import prisma from "../database/prisma";
import { CreateAddressDTO, UpdateAddressDTO } from "../types/address.types";

export class AddressRepository {
  async create(userId: string, data: CreateAddressDTO) {
    return prisma.userAddress.create({
      data: {
        user_id: userId,
        label: data.label,
        recipient_name: data.recipient_name,
        phone: data.phone,
        address_line: data.address_line,
        city: data.city,
        province: data.province,
        postal_code: data.postal_code,
        is_default: data.is_default || false
      }
    });
  }

  async findAll(userId: string) {
    return prisma.userAddress.findMany({
      where: { user_id: userId },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' }
      ]
    });
  }

  async findById(id: string) {
    return prisma.userAddress.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: Partial<UpdateAddressDTO>) {
    return prisma.userAddress.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.userAddress.delete({
      where: { id }
    });
  }

  async unsetAllDefaults(userId: string, excludeId?: string) {
    return prisma.userAddress.updateMany({
      where: { 
        user_id: userId,
        ...(excludeId && { id: { not: excludeId } })
      },
      data: { is_default: false }
    });
  }
}

export default new AddressRepository();
