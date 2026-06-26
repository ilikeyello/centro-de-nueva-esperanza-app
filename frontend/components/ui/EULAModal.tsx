import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { useLanguage } from "../../contexts/LanguageContext";

const EULA_KEY = "cne-eula-accepted";

export function EULAModal({ children }: { children: React.ReactNode }) {
  const [hasAccepted, setHasAccepted] = useState(true); // Default true to prevent flash, then check in useEffect
  const [isChecking, setIsChecking] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [showDialog, setShowDialog] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accepted = window.localStorage.getItem(EULA_KEY);
      if (!accepted) {
        setHasAccepted(false);
      }
      setIsChecking(false);
    }
  }, []);

  const handleAccept = () => {
    if (agreed) {
      window.localStorage.setItem(EULA_KEY, "true");
      setHasAccepted(true);
      setShowDialog(false);
    }
  };

  const handleDecline = () => {
    setShowDialog(false);
  };

  if (isChecking) {
    return null;
  }

  return (
    <>
      {hasAccepted ? (
        children
      ) : (
        <div className="relative min-h-screen">
          <div className="pointer-events-none opacity-20 blur-sm">
            {children}
          </div>
          
          {!showDialog && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <Button onClick={() => setShowDialog(true)} size="lg" className="shadow-lg">
                {t("Review Age Submission", "Revisar Envío de Edad")}
              </Button>
            </div>
          )}

          <Dialog open={showDialog}>
            <DialogContent className="sm:max-w-[425px]" showCloseButton={false} onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>{t("End User License Agreement (EULA)", "Acuerdo de Licencia de Usuario Final (EULA)")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="text-sm text-[--ink-mid] space-y-4 max-h-[40vh] overflow-y-auto">
                  <p>
                    {t(
                      "Welcome to the Centro de Nueva Esperanza community. To ensure a safe and welcoming environment for everyone, please review our community guidelines.",
                      "Bienvenido a la comunidad del Centro de Nueva Esperanza. Para garantizar un ambiente seguro y acogedor para todos, por favor revise nuestras pautas comunitarias."
                    )}
                  </p>
                  <p className="font-bold">
                    {t(
                      "There is absolutely no tolerance for objectionable content or abusive users.",
                      "No hay absolutamente ninguna tolerancia para el contenido objetable o los usuarios abusivos."
                    )}
                  </p>
                  <p>
                    {t(
                      "By using this app, you agree that you will not post content that is offensive, harmful, abusive, or otherwise violates our community standards. Any such content will be removed, and users who violate these terms will be permanently banned from the community.",
                      "Al utilizar esta aplicación, usted acepta que no publicará contenido que sea ofensivo, dañino, abusivo o que viole nuestros estándares comunitarios. Cualquier contenido de este tipo será eliminado y los usuarios que violen estos términos serán baneados permanentemente de la comunidad."
                    )}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="eula-agree"
                    checked={agreed}
                    onCheckedChange={(c) => setAgreed(c === true)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="eula-agree"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t("I am 18 years of age or older, and I agree to the terms.", "Tengo 18 años o más, y acepto los términos.")}
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:space-x-2">
                <Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto mt-2 sm:mt-0">
                  {t("Decline", "Rechazar")}
                </Button>
                <Button onClick={handleAccept} disabled={!agreed} className="w-full sm:w-auto">
                  {t("I Agree", "Acepto")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}
