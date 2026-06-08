import AddressRepository from "../repositories/address.repository";
import { CreateAddressDTO, UpdateAddressDTO } from "../types/address.types";

export class AddressService {
  async createAddress(userId: string, data: CreateAddressDTO) {
    // Validasi input
    if (!data.label || !data.recipient_name || !data.phone || !data.address_line || 
        !data.city || !data.province || !data.postal_code) {
      throw new Error("All fields are required: label, recipient_name, phone, address_line, city, province, postal_code");
    }

    // Jika set sebagai default, unset yang lain
    if (data.is_default === true) {
      await AddressRepository.unsetAllDefaults(userId);
    }

    return AddressRepository.create(userId, data);
  }

  async getAllAddresses(userId: string) {
    return AddressRepository.findAll(userId);
  }

  async getAddressById(id: string, userId: string) {
    const address = await AddressRepository.findById(id);

    if (!address) {
      throw new Error("Address not found");
    }

    if (address.user_id !== userId) {
      throw new Error("Forbidden: You can only access your own addresses");
    }

    return address;
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressDTO) {
    // Cek address exists dan ownership
    const existingAddress = await AddressRepository.findById(id);

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    if (existingAddress.user_id !== userId) {
      throw new Error("Forbidden: You can only update your own addresses");
    }

    // Validasi ada field yang diupdate
    if (!data.label && !data.recipient_name && !data.phone && !data.address_line && 
        !data.city && !data.province && !data.postal_code && data.is_default === undefined) {
      throw new Error("At least one field must be provided for update");
    }

    // Jika set sebagai default, unset yang lain
    if (data.is_default === true && !existingAddress.is_default) {
      await AddressRepository.unsetAllDefaults(userId, id);
    }

    // Build update data
    const updateData: any = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.recipient_name !== undefined) updateData.recipient_name = data.recipient_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address_line !== undefined) updateData.address_line = data.address_line;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.postal_code !== undefined) updateData.postal_code = data.postal_code;
    if (data.is_default !== undefined) updateData.is_default = data.is_default;

    return AddressRepository.update(id, updateData);
  }

  async deleteAddress(id: string, userId: string) {
    // Cek address exists dan ownership
    const existingAddress = await AddressRepository.findById(id);

    if (!existingAddress) {
      throw new Error("Address not found");
    }

    if (existingAddress.user_id !== userId) {
      throw new Error("Forbidden: You can only delete your own addresses");
    }

    await AddressRepository.delete(id);
  }
}

export default new AddressService();
