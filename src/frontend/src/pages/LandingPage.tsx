import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Leaf,
  MapPin,
  Shield,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-xs">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-brand-green" />
            <span className="text-xl font-bold text-brand-dark font-jakarta">
              {t("app.name")}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.how_it_works.link"
            >
              {t("nav.how_it_works")}
            </a>
            <a
              href="#for-farmers"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.for_farmers.link"
            >
              {t("nav.for_farmers")}
            </a>
            <a
              href="#for-transporters"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.for_transporters.link"
            >
              {t("nav.for_transporters")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="outline"
              className="rounded-pill border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="header.login.button"
            >
              {t("header.login")}
            </Button>
            <Button
              className="rounded-pill bg-brand-green text-white hover:opacity-90"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="header.get_started.button"
            >
              {t("header.get_started")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/farm-hero.dim_1400x700.jpg')",
          }}
        />
        <div
          className="absolute inset-0 bg-brand-dark"
          style={{ opacity: 0.72 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-pill bg-brand-green/20 text-green-300 text-sm font-semibold mb-6 border border-brand-green/30">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 font-jakarta">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            {t("hero.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-pill bg-brand-green text-white hover:opacity-90 text-base px-8"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="hero.request_pickup.button"
            >
              {t("hero.request_pickup")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-pill border-white text-white hover:bg-white hover:text-brand-dark text-base px-8"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="hero.join_transporter.button"
            >
              {t("hero.join_transporter")}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Feature Strip */}
      <section id="for-farmers" className="bg-muted py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-card flex gap-5"
              id="for-farmers"
            >
              <div className="flex-shrink-0 w-14 h-14 bg-accent rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-brand-dark" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  {t("features.farmers.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("features.farmers.desc")}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-card flex gap-5"
              id="for-transporters"
            >
              <div className="flex-shrink-0 w-14 h-14 bg-accent rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-brand-dark" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  {t("features.transporters.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("features.transporters.desc")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark font-jakarta">
              {t("how.title")}
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              {t("how.subtitle")}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                stepKey: "how.step1",
                titleKey: "how.step1.title",
                descKey: "how.step1.desc",
              },
              {
                icon: Truck,
                stepKey: "how.step2",
                titleKey: "how.step2.title",
                descKey: "how.step2.desc",
              },
              {
                icon: CheckCircle2,
                stepKey: "how.step3",
                titleKey: "how.step3.title",
                descKey: "how.step3.desc",
              },
            ].map(({ icon: Icon, stepKey, titleKey, descKey }, i) => (
              <motion.div
                key={stepKey}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                  <Icon className="w-8 h-8 text-brand-green" />
                </div>
                <span className="text-xs font-bold tracking-widest text-brand-green uppercase">
                  {t(stepKey)}
                </span>
                <h3 className="mt-2 text-xl font-bold text-brand-dark">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {t(descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-14 px-4">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-brand-dark px-8 py-12 flex flex-col md:flex-row items-center justify-around gap-8 text-white text-center"
          >
            <div>
              <div className="text-5xl font-bold text-brand-green font-jakarta">
                500+
              </div>
              <div className="mt-1 text-lg text-gray-300">
                {t("stats.transporters")}
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div>
              <div className="text-5xl font-bold text-brand-green font-jakarta">
                2,000+
              </div>
              <div className="mt-1 text-lg text-gray-300">
                {t("stats.farmers")}
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white/20" />
            <div>
              <div className="text-5xl font-bold text-brand-green font-jakarta">
                98%
              </div>
              <div className="mt-1 text-lg text-gray-300">
                {t("stats.deliveries")}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <Users className="mx-auto mb-5 w-12 h-12 text-brand-green" />
          <h2 className="text-3xl font-bold text-brand-dark font-jakarta mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">{t("cta.desc")}</p>
          <Button
            size="lg"
            className="rounded-pill bg-brand-green text-white hover:opacity-90 text-base px-10"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="cta.get_started.button"
          >
            {t("cta.button")}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white">
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-7 h-7 text-brand-green" />
                <span className="text-xl font-bold font-jakarta">
                  {t("app.name")}
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {t("footer.tagline")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">
                {t("footer.platform")}
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    {t("nav.how_it_works")}
                  </a>
                </li>
                <li>
                  <a
                    href="#for-farmers"
                    className="hover:text-white transition-colors"
                  >
                    {t("nav.for_farmers")}
                  </a>
                </li>
                <li>
                  <a
                    href="#for-transporters"
                    className="hover:text-white transition-colors"
                  >
                    {t("nav.for_transporters")}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-200">
                {t("footer.support")}
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    {t("footer.help_center")}
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    {t("footer.contact")}
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition-colors cursor-pointer">
                    {t("footer.privacy")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <div className="container max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <span>
              © {new Date().getFullYear()} {t("app.name")}. All rights reserved.
            </span>
            <span>
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
