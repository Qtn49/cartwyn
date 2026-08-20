import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cartwyn",
    short_name: "Cartwyn",
    description:
      "Relance automatique des paniers abandonnés et reporting mensuel du CA récupéré.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3ECE1",
    theme_color: "#F3ECE1",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
