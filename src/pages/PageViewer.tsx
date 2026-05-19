import { useParams } from "react-router-dom";
import PageViewer from "@/components/PageViewer";

export function PageViewerRoute(): React.ReactElement {
  const { slug } = useParams<{ slug: string }>();
  return <PageViewer pageTitle={slug || ""} pageSlug={slug || ""} />;
}
