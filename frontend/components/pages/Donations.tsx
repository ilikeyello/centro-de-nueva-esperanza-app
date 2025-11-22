import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, Heart, Building2, Globe } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useBackend } from "../../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";

const stripePromise = loadStripe("pk_test_placeholder");

interface DonationFormProps {
  onNavigate?: (page: string) => void;
}

function DonationForm({ onNavigate }: DonationFormProps) {
  const backend = useBackend();
  const { t } = useLanguage();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState<"general" | "missions" | "building" | "other">("general");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const createDonationMutation = useMutation({
    mutationFn: (data: {
      amount: number;
      donationType: "general" | "missions" | "building" | "other";
      message: string;
    }) => {
      return backend.donations.create(data);
    },
  });

  const confirmDonationMutation = useMutation({
    mutationFn: (data: { donationId: number; success: boolean }) => {
      return backend.donations.confirm(data);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      const donation = await createDonationMutation.mutateAsync({
        amount: parseFloat(amount),
        donationType,
        message,
      });

      const result = await stripe.confirmCardPayment(donation.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        await confirmDonationMutation.mutateAsync({
          donationId: donation.id,
          success: false,
        });
        toast({
          title: t("Error", "Error"),
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        await confirmDonationMutation.mutateAsync({
          donationId: donation.id,
          success: true,
        });
        toast({
          title: t("Thank you!", "¡Gracias!"),
          description: t("Your donation has been received", "Tu donación ha sido recibida"),
        });
        setAmount("");
        setMessage("");
        cardElement.clear();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Failed to process donation", "Error al procesar donación"),
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const donationTypes = [
    {
      value: "general",
      icon: Heart,
      labelEn: "General Fund",
      labelEs: "Fondo General",
    },
    {
      value: "missions",
      icon: Globe,
      labelEn: "Missions",
      labelEs: "Misiones",
    },
    {
      value: "building",
      icon: Building2,
      labelEn: "Building Fund",
      labelEs: "Fondo de Edificio",
    },
    {
      value: "other",
      icon: DollarSign,
      labelEn: "Other",
      labelEs: "Otro",
    },
  ];

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 text-center sm:text-left">
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
          <h1 className="text-3xl font-bold text-white">
            {t("Give to Our Church", "Dar a Nuestra Iglesia")}
          </h1>
        </div>
        <p className="text-neutral-400">
          {t(
            "Your generosity helps us serve our community and spread God's love",
            "Tu generosidad nos ayuda a servir a nuestra comunidad y difundir el amor de Dios"
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {donationTypes.map((type) => {
          const Icon = type.icon;
          const isActive = donationType === type.value;
          return (
            <Button
              key={type.value}
              variant="outline"
              className={`h-auto flex-col gap-2 p-4 text-sm ${
                isActive
                  ? "border-red-500 bg-red-700/20 text-red-50"
                  : "border-neutral-700 bg-neutral-900/70 text-neutral-100"
              }`}
              onClick={() => setDonationType(type.value as any)}
            >
              <Icon className="h-6 w-6" />
              <span className="font-semibold">
                {t(type.labelEn, type.labelEs)}
              </span>
            </Button>
          );
        })}
      </div>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="text-white">
            {t("Donation Details", "Detalles de Donación")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-neutral-200">
                {t("Amount ($)", "Cantidad ($)")}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="border-neutral-700 bg-neutral-800 text-white"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-neutral-200">
                {t("Message (optional)", "Mensaje (opcional)")}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-neutral-700 bg-neutral-800 text-white"
              />
            </div>
            <div>
              <Label className="text-neutral-200">
                {t("Card Details", "Detalles de Tarjeta")}
              </Label>
              <div className="mt-2 rounded-md border border-neutral-700 bg-neutral-800 p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        color: "#fff",
                        fontSize: "16px",
                        "::placeholder": {
                          color: "#737373",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!stripe || processing}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {processing
                ? t("Processing...", "Procesando...")
                : t("Donate Now", "Donar Ahora")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface DonationsProps {
  onNavigate?: (page: string) => void;
}

export function Donations({ onNavigate }: DonationsProps) {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm onNavigate={onNavigate} />
    </Elements>
  );
}
