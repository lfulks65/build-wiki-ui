/**
 * useApiQuery — a thin React Query wrapper around the API bridge.
 *
 * Provides consistent key, loading / error / data states, and sensible defaults.
 *
 * @example
 * ```tsx
 * const { data: vault, isLoading } = useApiQuery(["vault"], getVaultInfo);
 * ```
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Convenience hooks
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

export function useVaultInfo(options?: Omit<UseQueryOptions<VaultInfo>, "queryKey" | "queryFn">) {
  return useApiQuery<VaultInfo>(["vault"], getVaultInfo, options);
}

export function usePages(options?: Omit<UseQueryOptions<PageSummary[]>, "queryKey" | "queryFn">) {
  return useApiQuery<PageSummary[]>(["pages"], listPages, options);
}

export function useAssets(options?: Omit<UseQueryOptions<AssetSummary[]>, "queryKey" | "queryFn">) {
  return useApiQuery<AssetSummary[]>(["assets"], listAssets, options);
}

export function useCuratorStatus(options?: Omit<UseQueryOptions<CuratorStatus>, "queryKey" | "queryFn">) {
  return useApiQuery<CuratorStatus>(["curator-status"], getCuratorStatus, options);
}
