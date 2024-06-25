export const uiSuggestions = [
  "Create a responsive navbar with a logo, menu items, and a search bar",
  "Design a product card with an image, title, price, and add to cart button",
  "Generate a contact form with name, email, subject, and message fields",
  "Build a pricing table with three tiers: Basic, Pro, and Enterprise",
  "Create a footer with social media icons and newsletter signup"
];

export function getRandomSuggestion(): string {
  return uiSuggestions[Math.floor(Math.random() * uiSuggestions.length)];
}