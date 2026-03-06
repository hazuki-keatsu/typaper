import postFilter from "./postFilter";

type SortableEntry = {
  data: {
    draft?: boolean;
    pubDatetime: string | Date;
    modDatetime?: string | Date | null;
  };
};

const getSortedPosts = <T extends SortableEntry>(posts: T[]) => {
  return posts
    .filter(postFilter)
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
};

export default getSortedPosts;
