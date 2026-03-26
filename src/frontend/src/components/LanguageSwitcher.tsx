import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { Lang } from "../i18n/translations";
import { langLabels } from "../i18n/translations";

const langs: Lang[] = ["en", "kn", "hi"];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-pill border-border text-sm font-medium"
          aria-label="Switch language"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{langLabels[lang]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {langs.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLang(l)}
            className={lang === l ? "font-semibold text-brand-green" : ""}
          >
            {langLabels[l]}{" "}
            {l === "en" ? "— English" : l === "kn" ? "— ಕನ್ನಡ" : "— हिंदी"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
