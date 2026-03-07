import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getPath } from "@/utils/getPath";
import getSortedPosts from "@/utils/getSortedPosts";
import { DAILY_PATH } from "@/content.config";
import { SITE } from "@/config";

export async function GET() {
  const entries = await getCollection("daily");
  const sortedEntries = getSortedPosts(entries);
  return rss({
    title: `${SITE.title} - Daily`,
    description: SITE.desc,
    site: SITE.website,
    items: sortedEntries.map(({ data, id, filePath }) => ({
      link: getPath(id, filePath, {
        basePath: "/daily",
        contentPath: DAILY_PATH,
        slug: data.slug,
      }),
      title: data.title,
      pubDate: new Date(data.modDatetime ?? data.pubDatetime),
    })),
  });
}
