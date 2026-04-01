import { apiClient } from '@/lib/apiClient';

export interface Tag {
  id: string;
  name: string;
}

export interface TagsResponse {
  data: Tag[];
  meta: Record<string, unknown>;
}

export interface CreateTagPayload {
  name: string;
}

export async function fetchTags(): Promise<TagsResponse> {
  return apiClient<TagsResponse>('/tags');
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  return apiClient<Tag>('/tags', {
    method: 'POST',
    data: payload,
  });
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient<void>(`/tags/${id}`, {
    method: 'DELETE',
  });
}
