export interface ICartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
  maxStock: number;
}

export interface ICart {
  items: ICartItem[];
  subtotal: number;
  totalItems: number;
}

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  productId: string;
  quantity: number;
}
