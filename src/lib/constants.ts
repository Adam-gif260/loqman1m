export const APP_NAME = "NexCode";
export const APP_TAGLINE = "L'IA No-Code la plus puissante";
export const APP_DESCRIPTION = "Créez des applications complètes en décrivant simplement ce que vous voulez. Notre IA génère le code parfait en un seul coup.";

export const INITIAL_CREDITS = 15;
export const DAILY_FREE_CREDITS = 5;
export const REFERRAL_BONUS = 10;

export const PLANS = [
  {
    name: "Starter",
    price: 25,
    credits: 100,
    features: ["100 crédits/mois", "IA avancée", "Preview en temps réel", "Support email"],
    stripeUrl: "https://buy.stripe.com/test_7sY7sN629gIkdz97xu0x200",
    popular: false,
  },
  {
    name: "Pro",
    price: 50,
    credits: 300,
    features: ["300 crédits/mois", "IA ultra-performante", "Domaine personnalisé", "Support prioritaire", "Upload documents"],
    stripeUrl: "https://buy.stripe.com/test_aFaeVf1LTajW2Uv7xu0x201",
    popular: true,
  },
  {
    name: "Business",
    price: 89,
    credits: 1000,
    features: ["1000 crédits/mois", "IA illimitée", "Équipe collaborative", "API access", "Support dédié", "Analytics avancés"],
    stripeUrl: "https://buy.stripe.com/test_4gM14peyF63G2Uv2da0x202",
    popular: false,
  },
] as const;

export const MAX_CODE_LINES = 3000;
