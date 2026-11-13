import { Carrot, Fish, Egg, Snowflake, Archive, Candy, UtensilsCrossed, CupSoda, Wheat } from "lucide-react-native";

import { FOOD_IMAGES } from "./images";

export const CATEGORIES = [
  { slug: "fruits-vegetables", name: "Fruits & Vegetables", shortName: "Fruits & Veg", image: FOOD_IMAGES.vegetables, icon: Carrot },
  { slug: "meat-seafood-alternatives", name: "Meat & Seafood", shortName: "Meat & Fish", image: FOOD_IMAGES.meat, icon: Fish },
  { slug: "dairy-eggs", name: "Dairy & Eggs", shortName: "Dairy & Eggs", image: FOOD_IMAGES.eggs, icon: Egg },
  { slug: "frozen-food", name: "Frozen Food", shortName: "Frozen", image: FOOD_IMAGES.fries, icon: Snowflake },
  { slug: "pantry-food", name: "Pantry Food", shortName: "Pantry", image: FOOD_IMAGES.pantry, icon: Archive },
  { slug: "snacks-candy", name: "Snacks & Candy", shortName: "Snacks", image: FOOD_IMAGES.candy, icon: Candy },
  { slug: "deli-fresh-prepared", name: "Deli & Fresh Meals", shortName: "Deli", image: FOOD_IMAGES.deli, icon: UtensilsCrossed },
  { slug: "drinks", name: "Drinks", shortName: "Drinks", image: FOOD_IMAGES.drinks, icon: CupSoda },
  { slug: "bread-bakery", name: "Bread & Bakery", shortName: "Bakery", image: FOOD_IMAGES.bread, icon: Wheat },
];
