import { CreateCheckoutDTO } from "../types/checkout.types";

class CheckoutValidator {
  validateCreateCheckout(data: CreateCheckoutDTO) {
    const errors: string[] = [];

    if (!data.address_id) {
      errors.push("Address ID is required");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  }
}

export default new CheckoutValidator();
