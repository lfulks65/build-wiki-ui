import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";
import { PageList as PageListComponent } from "@/components/PageList";
import type { WikiPage } from "@/types/wiki";

/* ── Demo data ─────────────────────────────────────────────────────── */

const demoPages: WikiPage[] = [
  {
    id: "1",
    title: "Getting Started",
    slug: "getting-started",
    path: "/pages/getting-started",
    modified: new Date(Date.now() - 86400000).toISOString(),
    snippet: "Learn how to set up your wiki and create your first page.",
  },
  {
    id: "2",
    title: "Markdown Guide",
    slug: "markdown-guide",
    path: "/pages/markdown-guide",
    modified: new Date(Date.now() - 172800000).toISOString(),
    snippet: "A comprehensive guide to using Markdown for wiki pages.",
  },
  {
    id: "3",
    title: "API Reference",
    slug: "api-reference",
    path: "/pages/api-reference",
    modified: new Date(Date.now() - 345600000).toISOString(),
    snippet: "Complete API reference for the wiki backend.",
  },
];

/* ── Page — wrapper with demo data & confirm wire-up ───────────────── */

export function PageList(): React.ReactElement {
  const { confirm } = useConfirm();
  const [pages, setPages] = useState<WikiPage[]>(demoPages);

  const handleDeletePage = useCallback(
    async (page: WikiPage) => {
      const ok = await confirm({
        title: "Delete Page",
        message: `Are you sure you want to delete "${page.title}"? This action cannot be undone.`,
        variant: "danger",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
      });
      if (ok) {
        setPages((prev) => prev.filter((p) => p.id !== page.id));
      }
    },
    [confirm],
  );

  const handleNavigate = useCallback(
    (slug: string) => {
      window.location.hash = `/pages/${slug}`;
    },
    [],
  );

  const handleEditPage = useCallback(
    (slug: string) => {
      window.location.hash = `/pages/${slug}/edit`;
    },
    [],
  );

  const handleCreatePage = useCallback(async () => {
    const ok = await confirm({
      title: "Create New Page",
      message: "This will create a blank page. Continue?",
      variant: "info",
      confirmLabel: "Create",
      cancelLabel: "Cancel",
    });
    if (ok) {
      const newPage: WikiPage = {
        id: String(Date.now()),
        title: "New Page",
        slug: `page-${pages.length + 1}`,
        path: `/pages/page-${pages.length + 1}`,
        modified: new Date().toISOString(),
      };
      setPages((prev) => [newPage, ...prev]);
    }
  }, [confirm, pages.length]);

  return (
    <PageListComponent
      pages={pages}
      onNavigate={handleNavigate}
      onCreatePage={handleCreatePage}
      onDeletePage={handleDeletePage}
      onEditPage={handleEditPage}
    />
  );
}
