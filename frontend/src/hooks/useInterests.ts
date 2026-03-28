import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchInterests,
  fetchInterestById,
  updateInterest,
  type InterestsResponse,
  type InterestDetail,
  type UpdateInterestPayload,
} from '@/api/interests';

export const interestKeys = {
  all: ['interests'] as const,
  lists: () => [...interestKeys.all, 'list'] as const,
  list: (sort: 'asc' | 'desc') => [...interestKeys.lists(), sort] as const,
  details: () => [...interestKeys.all, 'detail'] as const,
  detail: (id: string) => [...interestKeys.details(), id] as const,
};

export interface UseInterestsOptions {
  sort?: 'asc' | 'desc';
}

export function useInterests(options: UseInterestsOptions = {}) {
  const { sort = 'desc' } = options;

  return useQuery<InterestsResponse>({
    queryKey: interestKeys.list(sort),
    queryFn: () => fetchInterests({ sort }),
  });
}

export function useInterestDetail(id: string | undefined) {
  return useQuery<InterestDetail>({
    queryKey: interestKeys.detail(id!),
    queryFn: () => fetchInterestById(id!),
    enabled: !!id,
  });
}

export function useUpdateInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInterestPayload }) =>
      updateInterest(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(interestKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() });
    },
  });
}
