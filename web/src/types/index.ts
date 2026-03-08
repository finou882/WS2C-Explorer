// pos テーブルに対応した型定義

export interface Item {
  id: string;
  name: string;
  pieces: number;
  category: string;
  status: string;
  location: string;
  timestamp: string;
}

export interface CreateItemInput {
  name: string;
  pieces?: number;
  category?: string;
  status?: string;
  location?: string;
}

export interface UpdateItemInput extends Partial<CreateItemInput> {}
