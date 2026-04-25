import { useColorScheme } from "react-native";
import { DarkColors, LightColors } from "./theme";

export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === "dark" ? DarkColors : LightColors;
};
