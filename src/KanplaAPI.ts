import axios from "axios";
import "dotenv/config";

export interface IKanplaAPI {
  email: string;
  password: string;
  firebaseAPIKey: string;
  firebaseModuleId: string;
  language: string;
}

const GOOGLE_LOGIN_URI =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=";
const GOOGLE_TOKEN_URI = "https://securetoken.googleapis.com/v1/token?key=";

class KanplaAPI implements IKanplaAPI {
  email: string;
  password: string;
  firebaseAPIKey: string;
  firebaseModuleId: string;
  language: string;

  constructor(props: IKanplaAPI) {
    this.email = props.email;
    this.password = props.password;
    this.firebaseAPIKey = props.firebaseAPIKey;
    this.firebaseModuleId = props.firebaseModuleId;
    this.language = props.language;
  }

  private async getGoogleToken() {
    const loginData = {
      email: this.email,
      password: this.password,
      returnSecureToken: true,
    };

    const loginResponse = await axios.post(
      GOOGLE_LOGIN_URI + this.firebaseAPIKey,
      loginData,
    );

    // Exchange the refresh token for a fresh access token
    const tokenResponse = await axios.post(
      GOOGLE_TOKEN_URI + this.firebaseAPIKey,

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

  async getFrontendData() {
    const { accessToken, userId } = await this.getGoogleToken();

    const body = {
      userId,
      url: "app",
      language: "da",
    };

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      accept: "application/json, text/plain, */*",
      "accept-language":
        "nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5",
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

    const request = await axios.post(
      "https://app.kanpla.dk/api/internal/load/frontend",
      body,
      {
        headers,
      },
    );

    if (request.status !== 200) {
      throw new Error("Failed to fetch data");
    }

    return request.data;
  }

  async getFrontendByModuleId() {
    const data = await this.getFrontendData();
    return data?.offers?.[this.firebaseModuleId]?.items || [];
  }
}

export default KanplaAPI;
