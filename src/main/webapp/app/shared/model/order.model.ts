export interface IOrder {
  id?: string;
  customerId?: string;
  customerName?: string;
  orderDate?: string | Date | null;
  totalAmount?: number;
  status?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  notes?: string;
  createdBy?: string;
  createdDate?: string | Date | null;
  lastModifiedBy?: string;
  lastModifiedDate?: string | Date | null;
}

export const defaultValue: Readonly<IOrder> = {
  id: '',
  customerId: '',
  orderDate: null,
  totalAmount: 0,
  status: 'PENDING',
  shippingAddress: '',
  paymentMethod: '',
  notes: '',
};

