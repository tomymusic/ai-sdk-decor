export interface Suggestion {
  text: string;
  prompt: string;
}

const artStyles = ["modern minimalism", "mid-century modern", "bohemian", "industrial", "art deco", "Scandinavian"];

const basePrompts: { text: string; prompt: string }[] = [
  {
    text: "Cozy Living Room",
    prompt: "A warm and inviting living room with soft lighting and a modern fireplace",
  },
  {
    text: "Luxury Kitchen",
    prompt: "A sleek and stylish kitchen with marble countertops and gold accents",
  },
  {
    text: "Boho Bedroom",
    prompt: "A cozy bedroom filled with plants, natural textures, and soft pastel tones",
  },
  {
    text: "Minimalist Office",
    prompt: "A modern home office with clean lines, neutral colors, and smart lighting",
  },
  {
    text: "Industrial Loft",
    prompt: "A spacious loft with exposed brick walls, metal beams, and warm wood flooring",
  },
  {
    text: "Scandinavian Dining Room",
    prompt: "A dining room with minimalist wooden furniture, soft lighting, and neutral tones",
  },
  {
    text: "Art Deco Lounge",
    prompt: "A glamorous lounge with velvet furniture, geometric patterns, and gold accents",
  },
  {
    text: "Modern Bathroom",
    prompt: "A spa-like bathroom with sleek fixtures, ambient lighting, and a rain shower",
  },
  {
    text: "Elegant Entryway",
    prompt: "A grand entryway with a statement chandelier, modern console table, and mirror wall",
  },
  {
    text: "Chic Balcony",
    prompt: "A stylish outdoor balcony with cozy seating, fairy lights, and greenery",
  },
  {
    text: "Sophisticated Library",
    prompt: "A home library with floor-to-ceiling bookshelves, warm lighting, and a classic armchair",
  },
  {
    text: "Coastal Retreat",
    prompt: "A serene living space with ocean views, light wood accents, and white furniture",
  },
  {
    text: "Glamorous Walk-In Closet",
    prompt: "A luxurious walk-in closet with custom shelving, LED lighting, and a central island",
  },
  {
    text: "Vintage Cafe Corner",
    prompt: "A cozy cafe-inspired kitchen nook with vintage decor, warm lighting, and a coffee station",
  },
  {
    text: "Luxury Penthouse",
    prompt: "A high-end penthouse living room with floor-to-ceiling windows and a skyline view",
  },
  {
    text: "Serene Zen Garden",
    prompt: "A minimalist Japanese-style garden with stone pathways, bamboo, and a water feature",
  },
  {
    text: "Bold Eclectic Space",
    prompt: "A vibrant living area with bold colors, mixed patterns, and curated art pieces",
  },
  {
    text: "Opulent Master Bedroom",
    prompt: "A lavish master bedroom with a grand bed, plush fabrics, and gold accents",
  },
  {
    text: "Dreamy Attic Retreat",
    prompt: "A cozy attic space with sloped ceilings, warm lighting, and a reading nook",
  },
  {
    text: "Tropical Paradise Patio",
    prompt: "An outdoor patio with lush plants, rattan furniture, and ambient string lights",
  },
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomSuggestions(count: number = 5): Suggestion[] {
  const shuffledPrompts = shuffle(basePrompts);
  const shuffledStyles = shuffle(artStyles);

  return shuffledPrompts.slice(0, count).map((item, index) => ({
    text: item.text,
    prompt: `${item.prompt}, in the style of ${shuffledStyles[index % shuffledStyles.length]}`,
  }));
}
