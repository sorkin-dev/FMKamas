export interface ExternalItemEffect {
  int_minimum: number;
  int_maximum: number;
  type: {
    id: number;
    name: string;
  };
  ignore_int_min_if_max?: boolean;
  ignore_int_max_if_max?: boolean;
  formatted: string;
}

export interface ExternalItem {
  ankama_id: number;
  name: string;
  description?: string;
  type: { id: number; name: string };
  level: number;
  pods?: number;
  image_urls?: { icon?: string; sd?: string; hd?: string };
  effects?: ExternalItemEffect[];
  recipe?: unknown[];
  conditions?: unknown;
}

export interface DofusdudeSearchResponse {
  items: ExternalItem[];
  links?: { next?: string; prev?: string };
}

export interface DofusdudeListResponse {
  items: ExternalItem[];
  links?: { next?: string; prev?: string };
}
