export const APP_NAME = "NexCode";
export const APP_TAGLINE = "L'IA No-Code la plus puissante";
export const APP_DESCRIPTION = "Créez des applications complètes en décrivant simplement ce que vous voulez. Notre IA génère le code parfait en un seul coup.";

export const INITIAL_CREDITS = 15;
export const DAILY_FREE_CREDITS = 5;
export const REFERRAL_BONUS = 20;

export const PLANS = [
  {
    name: "Starter",
    price: 25,
    credits: 100,
    features: ["100 crédits/mois", "IA avancée", "Preview en temps réel", "Support email"],
    stripeUrl: "https://buy.stripe.com/dRmeV63qgdUU4Q2bHrdnW00",
    popular: false,
  },
  {
    name: "Pro",
    price: 50,
    credits: 300,
    features: ["300 crédits/mois", "IA ultra-performante", "Domaine personnalisé", "Support prioritaire", "Upload documents"],
    stripeUrl: "https://buy.stripe.com/8x2fZaf8Y2ccdmydPzdnW01",
    popular: true,
  },
  {
    name: "Business",
    price: 89,
    credits: 1000,
    features: ["1000 crédits/mois", "IA illimitée", "Équipe collaborative", "API access", "Support dédié", "Analytics avancés"],
    stripeUrl: "https://buy.stripe.com/4gM8wI1i82ccgyK8vfdnW02",
    popular: false,
  },
] as const;

export const MAX_CODE_LINES = 3000;
