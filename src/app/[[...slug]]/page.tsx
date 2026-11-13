import { notFound } from "next/navigation";
import { getPage, getSite } from "@/lib/wordpress";
import { Header } from "@/components/molecules/header";
import { Sections } from "@/components/sections";
type Props = { params: Promise<{ slug?: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { slug = [] } = await params;
  if (!process.env.WORDPRESS_GRAPHQL_URL) return { title: "Y2K — setup" };
  const page = await getPage("/" + slug.join("/") + (slug.length ? "/" : ""));
  return {
    title: page?.title || "Y2K",
    description: page?.description,
  };
}
export default async function Page({ params }: Props) {
  if (!process.env.WORDPRESS_GRAPHQL_URL)
    return (
      <main id="main" className="custom-grid py-12">
        <div className="col-span-full">
          <h1 className="typo-heading text-accent">Y2K / connect WordPress</h1>
          <p className="mt-4">
            Run <code>npm run wp:setup</code> to start your local CMS, then
            restart Next.js.
          </p>
        </div>
      </main>
    );
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
