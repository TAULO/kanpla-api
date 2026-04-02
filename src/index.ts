import axios from "axios";
import "dotenv/config";

async function getGoogleToken() {
  const LOGIN_URI =
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
  const GOOGLE_TOKEN_URI = "https://securetoken.googleapis.com/v1/token?key=";

  const loginData = {
    email: process.env.FIREBASE_KANPLA_EMAIL,
    password: process.env.FIREBASE_KANPLA_PASSWORD,
    returnSecureToken: true,
  };

  const loginResponse = await axios.post(
    LOGIN_URI + process.env.FIREBASE_API_KEY,
    loginData,
  );

  // Exchange the refresh token for a fresh access token
  const tokenResponse = await axios.post(
    GOOGLE_TOKEN_URI + process.env.FIREBASE_API_KEY,

    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: loginResponse.data.refreshToken,
    }),
  );

  return {
    accessToken: tokenResponse.data.access_token,
    userId: loginResponse.data.localId,
  };
}

async function makeAPIRequest() {
  const { accessToken, userId } = await getGoogleToken();

  const body = {
    userId,
    url: "app",
    language: "da",
  };

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    accept: "application/json, text/plain, */*",
    "accept-language": "nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5",
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
    "kanpla-app-env": "PROD",
    "kanpla-auth-provider": "GAuth",
    "kanpla-debug": "true",
    "cache-control": "no-cache",
    pragma: "no-cache",
    expires: "0",
    referer: "https://app.kanpla.dk/app",
    origin: "https://app.kanpla.dk",
  };

  return await axios.post(
    "https://app.kanpla.dk/api/internal/load/frontend",
    body,
    {
      headers,
    },
  );
}

const request = await makeAPIRequest();
const subjectId = process.env.FIREBASE_MODULE_ID as string;

function getMenuType(productId: string) {
  const mainProductId = "g7QhdXeIJOP9CilXXDgx";
  const vegetarianProductId = "CYQ89qfs8vd5NbFMBCf5";

  switch (productId) {
    case mainProductId:
      return "main";
    case vegetarianProductId:
      return "vegetarian";
    default:
      return "other";
  }
}

function toUnixDay(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  return d.getTime() / 1000;
}

function getMenusByDate(date: Date) {
  return request.data?.offers?.[subjectId]?.items.reduce(
    (acc: any, item: any) => {
      const timestamp = toUnixDay(date).toString();
      const dates = item.dates[timestamp];
      const type = getMenuType(item.productId);

      acc.push({
        name: item.name,
        category: item.category,
        photo: item.photo,
        menu: dates?.menu,
        type,
      });

      return acc;
    },
    [],
  );
}

function getTodayMenu() {
  return getMenusByDate(new Date());
}

console.log(getMenusByDate(new Date("2026-04-01")));
console.log(getTodayMenu());
