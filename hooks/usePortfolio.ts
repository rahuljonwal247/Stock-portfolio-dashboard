// hooks/usePortfolio.ts
import useSWR from "swr";
import type { PortfolioResponse } from "@/types/portfolio";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });

export function usePortfolio() {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<PortfolioResponse>("/api/portfolio", fetcher, {
      refreshInterval: 15000,          // Auto-refresh every 15 seconds
      revalidateOnFocus: false,         // Don't re-fetch on tab focus
      revalidateOnReconnect: true,      // Re-fetch when network comes back
      dedupingInterval: 10000,          // Prevent duplicate requests within 10s
      errorRetryCount: 3,              // Retry on error up to 3 times
      errorRetryInterval: 5000,         // Wait 5s between retries
      keepPreviousData: true,          // Show old data while refreshing
    });

  return {
    portfolio: data,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error: error?.message ?? null,
    refetch: mutate,
  };
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = { current: undefined as T | undefined };
  const prev = ref.current;
  ref.current = value;
  return prev;
}
