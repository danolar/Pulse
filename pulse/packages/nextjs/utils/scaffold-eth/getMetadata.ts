import type { Metadata } from "next";
import { getAppBaseUrl } from "~~/services/appUrl";

const baseUrl = getAppBaseUrl();
const titleTemplate = "%s | pulse";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description: description,
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageUrl],
    },
    icons: {
      icon: [
        {
          url: "/brand/pulse-icon.svg",
          sizes: "512x512",
          type: "image/svg+xml",
        },
        {
          url: "/brand/pulse-mark.svg",
          sizes: "48x48",
          type: "image/svg+xml",
        },
      ],
      apple: "/brand/pulse-icon.svg",
    },
  };
};
