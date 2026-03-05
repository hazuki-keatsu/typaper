export const SITE = {
  website: "https://keatsu.top/", // replace this with your deployed domain
  author: "Hazuki Keatsu",
  profile: "https://keatsu.top/",
  desc: "にゃーん。",
  title: "Hazuki Keatsu",
  // ogImage: "astropaper-og.jpg",
  ogImage: "",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/hazuki-keatsu/typaper/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh_CN", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
