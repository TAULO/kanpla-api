import KanplaAPI, { type IKanplaAPI } from "./KanplaAPI.js";

export interface IMenuItem {
  name: string;
  category: string;
  photo: string;
  menu: IMenu;
  type: string;
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

  async getMenusByDate(date: Date): Promise<IMenuItem[]> {
    const frontendData = await this._kanplaAPI.getFrontendByModuleId();
    return frontendData.reduce((acc: any, item: any) => {
      const timestamp = this.toUnixDay(date).toString();
      const dates = item.dates[timestamp];
      const type = this.getMenuType(item.productId);

      acc.push({
        name: item.name,
        category: item.category,
        photo: item.photo,
        menu: dates?.menu as IMenu,
        type,
      });

      return acc;
    }, [] as IMenuItem[]);
  }

  async getTodayMenu(): Promise<IMenuItem[]> {
    return await this.getMenusByDate(new Date());
  }

  async getModuleIds(): Promise<string[]> {
    const data = await this._kanplaAPI.getFrontendData();
    const offers = data.offers;

    return Object.keys(offers);
  }
}

export default Kanpla;
