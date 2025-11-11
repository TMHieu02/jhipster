export interface IProduct {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  categoryId?: string;
  categoryName?: string;
  imageUrl?: string;
  active?: boolean;
  createdBy?: string;
  createdDate?: Date | null;
  lastModifiedBy?: string;
  lastModifiedDate?: Date | null;
}

export const defaultValue: Readonly<IProduct> = {
  id: '',
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  categoryId: '',
  categoryName: '',
  imageUrl: '',
  active: true,
};

