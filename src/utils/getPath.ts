import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

type PathOptions = {
  basePath?: string;
  contentPath?: string;
  includeBase?: boolean;
  slug?: string;
};

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  options: boolean | PathOptions = true
) {
  const includeBase =
    typeof options === "boolean" ? options : (options.includeBase ?? true);
  const basePath =
    typeof options === "boolean" ? "/posts" : (options.basePath ?? "/posts");
  const contentPath =
    typeof options === "boolean"
      ? BLOG_PATH
      : (options.contentPath ?? BLOG_PATH);
  const pathSegments = filePath
    ?.replace(contentPath, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  const pathBase = includeBase ? basePath : "";

  // Making sure `id` does not contain the directory
  const blogId = id.split("/");
  const slug = slugifyStr(
    (typeof options === "boolean" ? undefined : options.slug) ||
      (blogId.length > 0 ? blogId.at(-1) : id) ||
      id
  );

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    return [pathBase, slug].join("/");
  }

  return [pathBase, ...pathSegments, slug].join("/");
}
