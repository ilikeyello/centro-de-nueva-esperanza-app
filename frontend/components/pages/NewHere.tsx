import { ArrowLeft, Sparkles, Users, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";

interface NewHereProps {
  onNavigate?: (page: string) => void;
}

export function NewHere({ onNavigate }: NewHereProps) {
  const { t } = useLanguage();

  const highlights = [
    {
      icon: Sparkles,
      titleEn: "Warm Worship",
      titleEs: "Adoración Viva",
      descriptionEn: "Experience heartfelt worship and encouraging messages each week.",
      descriptionEs: "Experimenta adoración sincera y mensajes alentadores cada semana.",
    },
    {
      icon: Users,
      titleEn: "Authentic Community",
      titleEs: "Comunidad Auténtica",
      descriptionEn: "Connect with small groups and ministries for every age and season.",
      descriptionEs: "Conéctate con grupos pequeños y ministerios para cada edad y etapa.",
    },
    {
      icon: Coffee,
      titleEn: "Come Say Hello",
      titleEs: "Ven a Saludar",
      descriptionEn: "Stop by our welcome table after service—we would love to meet you.",
      descriptionEs: "Visita nuestra mesa de bienvenida después del servicio—nos encantaría conocerte.",
    },
  ];

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center gap-3">
        {onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("home")}
            className="text-neutral-300 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            {t("Plan Your Visit", "Planifica Tu Visita")}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            {t("New Here?", "¿Eres Nuevo?")}
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-300">
            {t(
              "We can't wait to welcome you. Here's what you can expect when you join us for worship and community.",
              "Estamos emocionados de darte la bienvenida. Esto es lo que puedes esperar cuando te unas a nosotros para adorar y hacer comunidad."
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.titleEn} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
              <Icon className="h-7 w-7 text-red-400" />
              <h3 className="mt-4 text-lg font-semibold text-white">
                {t(item.titleEn, item.titleEs)}
              </h3>
              <p className="mt-2 text-sm text-neutral-300">
                {t(item.descriptionEn, item.descriptionEs)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="text-xl font-semibold text-white">
          {t("Have Questions?", "¿Tienes Preguntas?")}
        </h2>
        <p className="mt-2 text-neutral-300">
          {t(
            "Reach out anytime and our team will help you plan your first visit, answer questions about ministries, or get connected.",
            "Comunícate en cualquier momento y nuestro equipo te ayudará a planificar tu primera visita, responder preguntas sobre los ministerios o conectarte."
          )}
        </p>
        <Button
          onClick={() => onNavigate?.("contact")}
          className="mt-4 bg-red-600 px-6 py-5 text-base font-semibold text-white hover:bg-red-700"
        >
          {t("Contact Us", "Contáctanos")}
        </Button>
      </div>
    </div>
  );
}
