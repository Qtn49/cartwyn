import { ImageResponse } from "next/og";

// Runtime Node par défaut (pas "edge") : le déploiement cible est un
// conteneur Docker autohébergé (voir CLAUDE.md), pas une plateforme edge.
export const alt = "Cartwyn — Récupérez le CA de vos paniers abandonnés";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage générée à la volée (LinkedIn, email, etc.) — convention
// Next.js, câble automatiquement les balises Open Graph et Twitter Card.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#F3ECE1",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#8C5A34",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#F3ECE1",
            }}
          >
            C
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#12100D",
              letterSpacing: "-0.01em",
            }}
          >
            Cartwyn
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 54,
            lineHeight: 1.15,
            fontWeight: 700,
            color: "#12100D",
            maxWidth: 920,
          }}
        >
          Récupérez le CA de vos paniers abandonnés.
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 26,
            color: "#12100D",
            opacity: 0.65,
            maxWidth: 820,
          }}
        >
          Relance automatique, qualification du frein d&apos;achat et
          reporting mensuel du CA réellement récupéré.
        </div>
      </div>
    ),
    { ...size }
  );
}
