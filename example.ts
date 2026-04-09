import Kanpla from "./src/Kanpla.js";

const kanpla = new Kanpla({
  email: process.env.FIREBASE_KANPLA_EMAIL as string,
  password: process.env.FIREBASE_KANPLA_PASSWORD as string,
  firebaseAPIKey: process.env.FIREBASE_API_KEY as string,
  firebaseModuleId: process.env.FIREBASE_MODULE_ID as string,
  language: "da",
});

const menu = await kanpla.getMenusByDate(new Date("2026-04-01"));

console.log(
  "Menu from date: 2026-04-01",
  menu
);

const nextWeekMenu = await kanpla.getNextWeekMenu();
console.log("Next week menu", nextWeekMenu);

const thisWeekMenu = await kanpla.getThisWeekMenu();
console.log("This week menu", thisWeekMenu);

