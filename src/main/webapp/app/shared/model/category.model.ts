export interface ICategory {
  id?: string;
  name?: string;
  description?: string;
  slug?: string;
  active?: boolean;
  imageUrl?: string;
  createdBy?: string;
  createdDate?: Date | null;
  lastModifiedBy?: string;
  lastModifiedDate?: Date | null;
}

export const defaultValue: Readonly<ICategory> = {
  id: '',
  name: '',
  description: '',
  slug: '',
  active: true,
  imageUrl: '',
};

