import { useNavigate } from "react-router-dom";
import { PageList as PageListComponent } from "@/components/PageList";
import { usePages } from "@/hooks/useApiQuery";

export function PageList() {
  const navigate = useNavigate();
  const { data: pages, isLoading, error, refetch } = usePages();

  // Map API PageSummary[] to component's WikiPage[] expected format
  const mappedPages = pages?.map((p) => ({
    id: p.path,
    slug: p.path,
    title: p.title || p.path || "",
    path: p.path,
    modified: p.modified || new Date().toISOString(),
  }));

  return (
    <PageListComponent
      pages={mappedPages}
      loading={isLoading}
      error={error instanceof Error ? error.message : null}
      onNavigate={(slug) => navigate(`/pages/${slug}`)}
      onCreatePage={() => navigate("/pages/new")}
    />
  );
}
