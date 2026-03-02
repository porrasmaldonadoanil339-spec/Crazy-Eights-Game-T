import { useProfile } from "@/context/ProfileContext";
import { t, TranslationKey } from "@/lib/i18n";

export function useT() {
  const { profile } = useProfile();
  const lang = profile.language ?? "es";
  return (key: TranslationKey) => t(key, lang);
}
