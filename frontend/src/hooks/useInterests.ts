import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  fetchInterests,
  fetchInterestById,
  updateInterest,
  createInterest,
  deleteInterest,
  type InterestsResponse,
  type InterestDetail,
  type UpdateInterestPayload,
  type CreateInterestPayload,
} from '@/api/interests';

export const interestKeys = {
  all: ['interests'] as const,
  lists: () => [...interestKeys.all, 'list'] as const,
  list: (sort: 'asc' | 'desc', keyword?: string, tagIds?: string[]) =>
    [...interestKeys.lists(), sort, keyword ?? '', ...(tagIds ?? [])] as const,
  details: () => [...interestKeys.all, 'detail'] as const,
  detail: (id: string) => [...interestKeys.details(), id] as const,
};

export interface UseInterestsOptions {
  sort?: 'asc' | 'desc';
}

export function useInfiniteInterests(
  sort: 'asc' | 'desc' = 'desc',
  keyword?: string,
  tagIds?: string[],
) {
  return useInfiniteQuery<
    InterestsResponse,
    Error,
    InfiniteData<InterestsResponse>,
    ReturnType<typeof interestKeys.list>,
    string | undefined
  >({
    queryKey: interestKeys.list(sort, keyword, tagIds),

    queryFn: ({ pageParam }) =>
      fetchInterests({
        sort,
        limit: 20,
        cursor: pageParam,
        keyword,
        tagIds,
      }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.meta.nextCursor ?? undefined;
    },
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

export function useCreateInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInterestPayload) => createInterest(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(interestKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() });
    },
  });
}

export function useDeleteInterest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInterest(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: interestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: interestKeys.lists() });
    },
  });
}
