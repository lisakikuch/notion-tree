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
  reflection?: string;
}

export interface InterestDetail {
  id: string;
  title: string;
  reflection: string;
  updatedAt: string;
  tags: Tag[];
}

export interface UpdateInterestPayload {
  title?: string;
  reflection?: string;
  tagIds?: string[];
}

export interface CreateInterestPayload {
  title: string;
  reflection?: string;
  tagIds?: string[];
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
  cursor?: string | null;
  keyword?: string;
  tagIds?: string[];
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
  if (params.cursor != null) {
    searchParams.set('cursor', params.cursor);
  }

  if (params.keyword && params.keyword.length >= 2) {
    searchParams.set('keyword', params.keyword);
  }
  if (params.tagIds && params.tagIds.length > 0) {
    params.tagIds.forEach((id) => searchParams.append('tagIds', id));
  }

  const queryString = searchParams.toString();
  const endpoint = `/interests${queryString ? `?${queryString}` : ''}`;
  return apiClient<InterestsResponse>(endpoint);
}

export async function fetchInterestById(id: string): Promise<InterestDetail> {
  return apiClient<InterestDetail>(`/interests/${id}`);
}

export async function updateInterest(
  id: string,
  payload: UpdateInterestPayload
): Promise<InterestDetail> {
  return apiClient<InterestDetail>(`/interests/${id}`, {
    method: 'PATCH',
    data: payload,
  });
}

export async function createInterest(
  payload: CreateInterestPayload
): Promise<InterestDetail> {
  return apiClient<InterestDetail>('/interests', {
    method: 'POST',
    data: payload,
  });
}

export async function deleteInterest(id: string): Promise<void> {
  await apiClient<void>(`/interests/${id}`, {
    method: 'DELETE',
  });
}
