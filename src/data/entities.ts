export interface Product {
  id: number;
  productName: string;
  category: string | null;
  actualPrice: number;
  installmentPercentage: number;
  totalInstallmentPrice: number;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: number;
  customerName: string;
  phoneNumber: string | null;
  address: string | null;
  createdAt: number;
  updatedAt: number;
}

/** customerId / productId are nullable: v1 saves plain calculations with no customer or product. */
export interface InstallmentPlan {
  id: string;
  /** Name given when saving. Optional because calculations saved before this feature have none. */
  name?: string;
  customerId: string | null;
  productId: string | null;
  actualPrice: number;
  installmentPercentage: number;
  totalInstallmentPrice: number;
  downPaymentPercentage: number;
  downPaymentAmount: number;
  remainingAmount: number;
  numberOfInstallments: number;
  monthlyInstallment: number;
  createdAt: number;
}

export type NewInstallmentPlan = Omit<InstallmentPlan, 'id' | 'createdAt' | 'customerId' | 'productId'> &
  Partial<Pick<InstallmentPlan, 'customerId' | 'productId'>>;
