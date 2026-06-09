export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  order: number;
  children?: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  order?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {
  isActive?: boolean;
}
