export interface IAddress {
  id: string;
  userId: string;
  alias: string;
  fullName: string;
  phone: string;
  street: string;
  number?: string;
  complement?: string;
  district?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressDTO {
  alias: string;
  fullName: string;
  phone: string;
  street: string;
  number?: string;
  complement?: string;
  district?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressDTO extends Partial<CreateAddressDTO> {}
