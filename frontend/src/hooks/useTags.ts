import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTags,
  createTag,
  deleteTag,
  type TagsResponse,
  type Tag,
  type CreateTagPayload,
} from '@/api/tags';
import { interestKeys } from '@/hooks/useInterests';

export const tagKeys = {
  all: ['tags'] as const,
  list: () => [...tagKeys.all, 'list'] as const,
};

export function useTags() {
  return useQuery<TagsResponse>({
    queryKey: tagKeys.list(),
    queryFn: fetchTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
    },
  });
}

export function useDeleteTag(noteId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.list() });
      if (noteId) {
        queryClient.invalidateQueries({ queryKey: interestKeys.detail(noteId) });
      }
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() });
    },
  });
}
