import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id?: number;
  items: SaleItem[];
  total: number;
  profit: number;
  note?: string;
  sellerName: string;
  createdAt: Date;
}

export interface Debt {
  id?: number;
  customerName: string;
  amount: number;
  note?: string;
  paid: boolean;
  createdAt: Date;
  paidAt?: Date;
}

class TindaFlowDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  debts!: Table<Debt>;

  constructor() {
    super('TindaFlowDB');
    this.version(1).stores({
      products: '++id, name, category, stock',
      sales: '++id, createdAt, sellerName',
      debts: '++id, customerName, paid, createdAt',
    });
  }
}

export const db = new TindaFlowDB();
