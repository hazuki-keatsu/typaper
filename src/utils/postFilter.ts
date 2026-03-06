import { SITE } from "@/config";

type PublishableEntry = {
  data: {
    draft?: boolean;
    pubDatetime: string | Date;
  };
};

const postFilter = <T extends PublishableEntry>({ data }: T) => {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
