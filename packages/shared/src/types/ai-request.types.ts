export enum AIRequestStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  ANALYZED = 'ANALYZED',
  ALTERNATIVES_FOUND = 'ALTERNATIVES_FOUND',
  REVIEWED = 'REVIEWED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

export interface IAIRequest {
  id: string;
  userId: string;
  originalUrl: string;
  sourceMarketplace?: string;
  extractedName?: string;
  extractedBrand?: string;
  extractedModel?: string;
  extractedCategory?: string;
  extractedPrice?: number;
  extractedCurrency?: string;
  extractedSpecs?: Record<string, unknown>;
  extractedImages?: string[];
  status: AIRequestStatus;
  alternatives: IProductAlternative[];
  adminNotes?: string;
  adminReviewedById?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductAlternative {
  id: string;
  requestId: string;
  name: string;
  brand?: string;
  model?: string;
  price: number;
  currency: string;
  supplier?: string;
  supplierUrl?: string;
  confidence: number;
  notes?: string;
  isSelected: boolean;
  createdAt: Date;
}

export interface CreateLinkRequestDTO {
  url: string;
  notes?: string;
}

export interface AIAnalysisResult {
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  price?: number;
  currency?: string;
  specifications?: Record<string, unknown>;
  images?: string[];
  marketplace?: string;
}
