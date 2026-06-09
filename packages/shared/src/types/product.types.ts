export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  images: IProductImage[];
  specifications: IProductSpecification[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  productId: string;
}

export interface IProductSpecification {
  id: string;
  name: string;
  value: string;
  productId: string;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  brand?: string;
  model?: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  isFeatured?: boolean;
  categoryId: string;
  images?: { url: string; alt?: string; order: number }[];
  specifications?: { name: string; value: string }[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
