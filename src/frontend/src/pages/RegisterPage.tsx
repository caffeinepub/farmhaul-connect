import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Tractor, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppRole } from "../App";
import { UserRole } from "../backend.d";
import type { UserProfile } from "../backend.d";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import { useRegister } from "../hooks/useQueries";

interface Props {
  onRoleSet: (role: AppRole) => void;
  existingProfile?: UserProfile;
}

export default function RegisterPage({ onRoleSet, existingProfile }: Props) {
  const [name, setName] = useState(existingProfile?.name ?? "");
  const [phone, setPhone] = useState(existingProfile?.phone ?? "");
  const [role, setRole] = useState<AppRole | null>(null);
  const registerMutation = useRegister();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error(t("register.role_required"));
      return;
    }
    if (!name.trim() || !phone.trim()) {
      toast.error(t("register.fields_required"));
      return;
    }
    try {
      if (!existingProfile) {
        await registerMutation.mutateAsync({
          name,
          phone,
          role: UserRole.user,
        });
      }
      onRoleSet(role);
      toast.success(t("register.success"));
    } catch {
      toast.error(t("register.failed"));
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-card p-8">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-brand-green" />
            <span className="text-xl font-bold text-brand-dark font-jakarta">
              {t("app.name")}
            </span>
          </div>
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-brand-dark mb-1">
          {existingProfile
            ? t("register.choose_role")
            : t("register.create_profile")}
        </h1>
        <p className="text-muted-foreground mb-8">
          {existingProfile ? t("register.select_how") : t("register.tell_us")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!existingProfile && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t("register.full_name")}</Label>
                <Input
                  id="name"
                  placeholder={t("register.full_name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-ocid="register.name.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("register.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("register.phone")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-ocid="register.phone.input"
                />
              </div>
            </>
          )}

          <div className="space-y-3">
            <Label>{t("register.i_am")}</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("farmer")}
                data-ocid="register.farmer.toggle"
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  role === "farmer"
                    ? "border-brand-green bg-accent"
                    : "border-border hover:border-brand-green/40"
                }`}
              >
                <Tractor className="w-8 h-8 mb-3 text-brand-green" />
                <div className="font-semibold text-brand-dark">
                  {t("register.farmer")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("register.farmer.desc")}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("transporter")}
                data-ocid="register.transporter.toggle"
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  role === "transporter"
                    ? "border-brand-green bg-accent"
                    : "border-border hover:border-brand-green/40"
                }`}
              >
                <Truck className="w-8 h-8 mb-3 text-brand-green" />
                <div className="font-semibold text-brand-dark">
                  {t("register.transporter")}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("register.transporter.desc")}
                </div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-pill bg-brand-green text-white hover:opacity-90"
            disabled={registerMutation.isPending}
            data-ocid="register.submit.button"
          >
            {registerMutation.isPending
              ? t("register.creating")
              : t("register.create_button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
