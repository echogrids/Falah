import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Falah",
    short_name: "Falah",
    description: "Family Ibadah Tracker",
    start_url: "/",
    display: "standalone",
    background_color: "#fcf8ed",
    theme_color: "#336144",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
