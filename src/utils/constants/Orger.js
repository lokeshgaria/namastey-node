const PACKAGES_ENUM = {
  BASIC: "basic",
  PREMIUM: "premium",
  PRO: "pro",
};

const plans = {
  premium: {
    name: PACKAGES_ENUM.PREMIUM,
    price: 199,
    color: "from-pink-500 to-orange-500",
    // icon: <Crown className="w-6 h-6" />,
    features: [
      { text: "Unlimited Likes", included: true },
      { text: "See who liked you", included: true },
      { text: "5 Super Likes per week", included: true },
      { text: "1 Boost per month", included: true },
      { text: "Advanced Filters", included: true },
      { text: "Rewind (Unlimited)", included: true },
      { text: "Read Receipts", included: false },
      { text: "Priority Support", included: true },
      { text: "Travel Mode", included: false },
      { text: "Concierge Service", included: false },
    ],
    cta: "Upgrade Now",
    popular: true,
  },
  pro: {
    name: PACKAGES_ENUM.PRO,
    price: 399,
    color: "from-purple-600 to-pink-600",
    // icon: <Rocket className="w-6 h-6" />,
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Unlimited Super Likes", included: true },
      { text: "Unlimited Boosts", included: true },
      { text: "Top Picks Daily", included: true },
      { text: "Read Receipts", included: true },
      { text: "Travel Mode", included: true },
      { text: "Concierge Service", included: true },
      { text: "Profile Review & Optimization", included: true },
      { text: "Priority in Search Results", included: true },
      { text: "24/7 VIP Support", included: true },
    ],
    cta: "Go Pro",
    popular: false,
  },
};

module.exports = {
  plans,
};
