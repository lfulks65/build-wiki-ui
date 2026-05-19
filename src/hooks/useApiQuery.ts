/**
 * `useApiQuery` — a thin React Query wrapper around the API bridge.
 *
 * Provides a consistent key, loading / error / data states, and sensible
 * defaults for wiki data (5-minute stale time, manual refetch).
 *
 * @example
 * ```tsx
 * const { data: vault, isLoading } = useApiQuery(["vault"], getVaultInfo);
 * ```
 *
 * @module hooks/useApiQuery
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

/**
 * Create a React Query hook for an API function.
 *
 * @param key       — React Query key array.
 * @param fetcher   — The API function to call (returns `Promise<T>`).
 * @param options   — Additional `UseQueryOptions` overrides.
 *
 * @returns The standard `UseQueryResult` shape.
 */
export function useApiQuery<TData = unknown>(
  key: string[],
  fetcher: () => Promise<TData>,
  options?: Omit<
    UseQueryOptions<TData>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<TData>({
    queryKey: key,
    queryFn: () => fetcher(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Convenience hooks for the most common API calls
// ---------------------------------------------------------------------------

import {
  getVaultInfo,
  listPages,
  listAssets,
  getCuratorStatus,
  type VaultInfo,
  type PageSummary,
  type AssetSummary,
  type CuratorStatus,
} from "../lib/api";

/** Hook for vault metadata. */
export function useVaultInfo(options?: Omit<UseQueryOptions<VaultInfo>, "queryKey" | "queryFn">) {
  return useApiQuery<VaultInfo>(["vault"], getVaultInfo, options);
}

/** Hook for the page list. */
export function usePages(options?: Omit<UseQueryOptions<PageSummary[]>, "queryKey" | "queryFn">) {
  return useApiQuery<PageSummary[]>(["pages"], listPages, options);
}

/** Hook for the asset list. */
export function useAssets(options?: Omit<UseQueryOptions<AssetSummary[]>, "queryKey" | "queryFn">) {
  return useApiQuery<AssetSummary[]>(["assets"], listAssets, options);
}

/** Hook for the curator status. */
export function useCuratorStatus(options?: Omit<UseQueryOptions<CuratorStatus>, "queryKey" | "queryFn">) {
  return useApiQuery<CuratorStatus>(["curator-status"], getCuratorStatus, options);
}
