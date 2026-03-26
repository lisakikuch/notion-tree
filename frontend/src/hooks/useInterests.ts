import { useQuery } from '@tanstack/react-query';
import { fetchInterests, type InterestsResponse } from '@/api/interests';

export interface UseInterestsOptions {
  sort?: 'asc' | 'desc';
}

export function useInterests(options: UseInterestsOptions = {}) {
  const { sort = 'desc' } = options;

  return useQuery<InterestsResponse>({
    queryKey: ['interests', { sort }],
    queryFn: () => fetchInterests({ sort }),
  });
}
