/* ── PageList — wiki page browser wired to API layer ─────────────── */

import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageList as PageListComponent } from "@/components/PageList";
import { listPages, type PageSummary } from "@/lib/api";
import { type WikiPage } from "@/types/wiki";

/** Convert API PageSummary → component WikiPage (fill in derived fields). */
function toWikiPage(summary: PageSummary, idx: number): WikiPage {
  return {
    id: `page-${idx}`,
    title: summary.title,
    slug: summary.path.replace(/\.md$/, "").replace(/\//g, "-"),
    path: summary.path,
    modified: summary.modified,
    snippet: undefined,
  };
}

export function PageList(): React.ReactElement {
  const navigate = useNavigate();

  // Fetch pages from API via React Query
  const { data: summaries = [], isLoading, error } = useQuery({
    queryKey: ["pages"],
    queryFn: listPages,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const pages: WikiPage[] = useMemo(
    () => summaries.map(toWikiPage),
    [summaries]
  );

  const handleNavigate = useCallback(
    (slug: string) => {
      // Handle both "/pages/:slug" and "pages/:slug/edit" formats
      const target = slug.startsWith("/") ? slug : `/pages/${slug}`;
      navigate(target);
    },
    [navigate]
  );

  const handleCreatePage = useCallback(() => {
    navigate("/pages/new/edit");
  }, [navigate]);

  return (
    <PageListComponent
      pages={pages}
      loading={isLoading}
      error={error?.message ?? null}
      onNavigate={handleNavigate}
      onCreatePage={handleCreatePage}
    />
  );
}
