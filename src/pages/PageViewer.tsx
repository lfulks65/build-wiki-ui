import { useParams } from "react-router-dom";
import PageViewer from "@/components/PageViewer";

/**
 * PageViewer page — renders a single wiki page at `/pages/:slug`.
 *
 * Extracts the slug from the route and derives a title for display.
 */
export function PageViewer(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  const pageTitle = slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Page";

  return <PageViewer pageTitle={pageTitle} pageSlug={slug} />;
}
