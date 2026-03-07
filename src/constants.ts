import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconPinterest from "@/assets/icons/IconPinterest.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/hazuki-keatsu",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "Mail",
    href: "mailto:yeyuefeng699@outlook.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

export const PROTOCOL_LINKS = {
  "CC BY": {
    label: "CC BY",
    href: "https://creativecommons.org/licenses/by/4.0/",
  },
  "CC BY-SA": {
    label: "CC BY-SA",
    href: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  "CC BY-NC": {
    label: "CC BY-NC",
    href: "https://creativecommons.org/licenses/by-nc/4.0/",
  },
  "CC BY-NC-SA": {
    label: "CC BY-NC-SA",
    href: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
  "CC BY-ND": {
    label: "CC BY-ND",
    href: "https://creativecommons.org/licenses/by-nd/4.0/",
  },
  "CC BY-NC-ND": {
    label: "CC BY-NC-ND",
    href: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  },
  CC0: {
    label: "CC0",
    href: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
} as const;

export type ProtocolLinkKey = keyof typeof PROTOCOL_LINKS;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: IconPinterest,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;
