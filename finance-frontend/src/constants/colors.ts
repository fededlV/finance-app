export const colors = {
  background: "#F4F7F5",
  surface: "#FFFFFF",
  textPrimary: "#172B1F",
  textSecondary: "#4B6354",
  primary: "#1E8E5A",
  primaryDark: "#136A42",
  accent: "#F4A259",
  danger: "#D94E4E",
  warning: "#D98E04",
  info: "#2D7FF9",
  border: "#D5E2DA",
  successSoft: "#DDF5E9",
  dangerSoft: "#FCE4E4",
} as const;

export type AppColors = typeof colors;
