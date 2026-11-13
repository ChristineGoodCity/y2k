import { notFound } from "next/navigation";
import { getPage, getSite } from "@/lib/content";
import { Header } from "@/components/molecules/header";
import { Sections } from "@/components/sections";
type Props = { params: Promise<{ slug?: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { slug = [] } = await params;
  const page = await getPage("/" + slug.join("/") + (slug.length ? "/" : ""));
  return {
    title: page?.title || "Y2K",
    description: page?.description,
  };
}
export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const [page, site] = await Promise.all([
    getPage("/" + slug.join("/") + (slug.length ? "/" : "")),
    getSite(),
  ]);
  if (!page) notFound();
  return (
    <>
      <Header site={site} />
      <main id="main">
        <h1 className="sr-only">{page.title}</h1>
        <Sections sections={page.sections} />
      </main>
    </>
  );
}
