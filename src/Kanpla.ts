import KanplaAPI, { type IKanplaAPI } from "./KanplaAPI.js";

export interface IMenuItem {
  name: string;
  category: string;
  photo: string;
  menu: IMenu;
  type: "main" | "vegetarian" | "other";
}

export interface IMenu {
  description: string;
  productId: string;
  moduleId: string;
  dateSeconds: number;
  allergens: Object;
  labels: Object;
  pictograms: Object;
  name: string;
}

export interface WeekMenu {
  [dateKey: string]: IMenuItem[];
}

class Kanpla {
  private _kanplaAPI: KanplaAPI;

  constructor(props: IKanplaAPI) {
    this._kanplaAPI = new KanplaAPI({
      email: props.email,
      password: props.password,
      firebaseAPIKey: props.firebaseAPIKey,
      firebaseModuleId: props.firebaseModuleId,
      language: props.language,
    });
  }

  private getMenuType(productId: string) {
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

  private toUnixDay(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    return d.getTime() / 1000;
  }

  private getMenuData(frontendData: Array<any>, date: Date) {
    return frontendData.reduce((acc: any, item: any) => {
      const timestamp = this.toUnixDay(date).toString();
      const dates = item.dates[timestamp];
      const type = this.getMenuType(item.productId);

      acc.push({
        name: item.name,
        category: item.category,
        photo: item.photo,
        menu: dates?.menu as IMenu,
        date: new Date(date.getTime()),
        type,
      });

      return acc;
    }, [] as IMenuItem[]);
  }

  async getMenusByDate(date: Date): Promise<IMenuItem[]> {
    const frontendData = await this._kanplaAPI.getFrontendByModuleId();
    return this.getMenuData(frontendData, date);
  }

  async getTodayMenu(): Promise<IMenuItem[]> {
    return await this.getMenusByDate(new Date());
  }

  async getThisWeekMenu(): Promise<WeekMenu> {
    const frontendData = await this._kanplaAPI.getFrontendByModuleId();

    const menus: WeekMenu = {};
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      menus[dateKey as string] = await this.getMenuData(frontendData, date);
    }

    return menus;
  }

  async getNextWeekMenu(): Promise<WeekMenu> {
    const frontendData = await this._kanplaAPI.getFrontendByModuleId();

    const menus: WeekMenu = {};
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 7);

    for (let i = 0; i < 5; i++) {
      const date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      menus[dateKey as string] = await this.getMenuData(frontendData, date);
    }

    return menus;
  }

  async getModuleIds(): Promise<string[]> {
    const data = await this._kanplaAPI.getFrontendData();
    const offers = data.offers;

    return Object.keys(offers);
  }
}

export default Kanpla;
