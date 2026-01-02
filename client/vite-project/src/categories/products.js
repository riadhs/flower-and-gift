import flowerBouquet from "./flowerBouquet";
import candies from "./candies";
import stuffedAnimal from "./stuffedAnimal";
import balloons from "./balloons";
import jewelry from "./jewelry";
import greetingCards from "./greetingCards";
import blanket from "./blanket";

export const byCategory = {
  "Flower Bouquet": flowerBouquet,
  Candies: candies,
  "Stuffed Animal": stuffedAnimal,
  Balloons: balloons,
  Jewelry: jewelry,
  "Greeting Cards": greetingCards,
  Blanket: blanket,
};

export const all = Object.values(byCategory).flat();
