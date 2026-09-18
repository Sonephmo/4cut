/** Shared preview/print layout in the supplied 960 × 1440 design coordinates. */
export const AC_FRAME = {
  width: 960,
  height: 1440,
  background: "#52C482",
  photo: { x: 48, y: 51, w: 863, h: 1034 },
  logo: { x: 208.9, y: 1091.54, w: 551.94, h: 310.46 },
  logoSrc: "animal-crossing/logo-background.png",
  font: "Animal Crossing Logo",
  textColor: "#FEFEE9",
  labels: [
    { text: "모여봐요", x: 293.05, y: 1155.89, w: 361.36, h: 103.95, size: 48, spacing: 0.5 },
    { text: "차대의숲", x: 199, y: 1240.04, w: 544.51, h: 103.95, size: 64, spacing: 0.77 },
  ],
} as const;
