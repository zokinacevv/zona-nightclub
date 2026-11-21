import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ZONA Admin",
    short_name: "ZONA Admin",
    description: "ZONA reservation management for staff.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/images/zona-mark.png",
        sizes: "1536x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
