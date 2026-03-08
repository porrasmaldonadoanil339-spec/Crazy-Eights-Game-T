import { useProfile } from "@/context/ProfileContext";
import { t, TranslationKey, Lang } from "@/lib/i18n";

export function useT() {
  const { profile } = useProfile();
  const lang = (profile.language ?? "es") as Lang;
  return (key: TranslationKey) => t(key, lang);
}
