import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
  const { t, language } = useLanguage();

  const footerContent = {
    en: {
      churchName: "Center of New Hope",
      locations: [
        {
          name: "Yuma Location",
          address: "[Address Coming Soon]",
          serviceTime: "Sunday at 3:00 PM",
        },
        {
          name: "Holyoke Location",
          address: "[Address Coming Soon]",
          serviceTime: "Sunday at 7:00 PM",
        },
      ],
      phone: "(555) 123-4567",
      email: "info@centerofnewhope.org",
      quickLinks: {
        home: "Home",
        about: "About Us",
        events: "Events",
        media: "Media",
        give: "Give",
        contact: "Contact",
      },
      socialTitle: "Follow Us",
      copyright: "© 2024 Center of New Hope. All rights reserved.",
    },
    es: {
      churchName: "Centro de Nueva Esperanza",
      locations: [
        {
          name: "Ubicación Yuma",
          address: "[Dirección Próximamente]",
          serviceTime: "Domingo a las 3:00 PM",
        },
        {
          name: "Ubicación Holyoke",
          address: "[Dirección Próximamente]",
          serviceTime: "Domingo a las 7:00 PM",
        },
      ],
      phone: "(555) 123-4567",
      email: "info@centrodenuevaesperanza.org",
      quickLinks: {
        home: "Inicio",
        about: "Nosotros",
        events: "Eventos",
        media: "Medios",
        give: "Ofrendar",
        contact: "Contacto",
      },
      socialTitle: "Síguenos",
      copyright: "© 2024 Centro de Nueva Esperanza. Todos los derechos reservados.",
    },
  };

  const content = footerContent[language];

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Church Info */}
          <div className="space-y-4">
            <h3 className="serif-heading text-xl font-bold text-warm-red">
              {content.churchName}
            </h3>
            <div className="space-y-4 text-sm text-neutral-300">
              {content.locations.map((location, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{location.name}</p>
                      <p className="text-neutral-400">{location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{location.serviceTime}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href={`tel:${content.phone}`} className="hover:text-warm-red transition-colors">
                  {content.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href={`mailto:${content.email}`} className="hover:text-warm-red transition-colors">
                  {content.email}
                </a>
              </div>
            </div>
          </div>

          {/* Service Times - Now integrated with locations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-warm-red">
              {t("Service Times", "Horarios de Servicio")}
            </h3>
            <div className="space-y-2 text-sm text-neutral-300">
              {content.locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{location.name}: {location.serviceTime}</span>
                </div>
              ))}
            </div>
            
            {/* Note about two locations */}
            <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
              <p className="text-xs text-neutral-400">
                {t(
                  "We now have two locations to serve you better!",
                  "¡Ahora tenemos dos ubicaciones para servirte mejor!"
                )}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-warm-red">
              {t("Quick Links", "Enlaces Rápidos")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-neutral-300 hover:text-warm-red transition-colors">
                  {content.quickLinks.home}
                </a>
              </li>
              <li>
                <a href="#newHere" className="text-neutral-300 hover:text-warm-red transition-colors">
                  {content.quickLinks.about}
                </a>
              </li>
              <li>
                <a href="#news" className="text-neutral-300 hover:text-warm-red transition-colors">
                  {content.quickLinks.events}
                </a>
              </li>
              <li>
                <a href="#media" className="text-neutral-300 hover:text-warm-red transition-colors">
                  {content.quickLinks.media}
                </a>
              </li>
              <li>
                <a href="#donations" className="text-neutral-300 hover:text-warm-red transition-colors">
                  {content.quickLinks.give}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-neutral-300 hover:text-warm-red transition-colors">
                  {content.quickLinks.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-warm-red">
              {content.socialTitle}
            </h3>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-red hover:bg-light-warm-red transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-red hover:bg-light-warm-red transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-red hover:bg-light-warm-red transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-neutral-400 mt-4">
              {t(
                "Join our online community for daily encouragement and updates.",
                "Únete a nuestra comunidad en línea para estímulo diario y actualizaciones."
              )}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-400">
          <p>{content.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
