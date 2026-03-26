import { apiClient } from '@/lib/apiClient';

export interface Tag {
  id: string;
  name: string;
}

export interface Interest {
  id: string;
  title: string;
  updatedAt: string;
  tags: Tag[];
}

export interface InterestsResponse {
  data: Interest[];
  meta: {
    nextCursor: string | null;
  };
}

export interface FetchInterestsParams {
  sort?: 'asc' | 'desc';
  limit?: number;
  cursor?: string;
}

export async function fetchInterests(
  params: FetchInterestsParams = {}
): Promise<InterestsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.sort) {
    searchParams.set('sort', params.sort);
  }
  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const queryString = searchParams.toString();
  const endpoint = `/interests${queryString ? `?${queryString}` : ''}`;
  
  return apiClient<InterestsResponse>(endpoint);
}
