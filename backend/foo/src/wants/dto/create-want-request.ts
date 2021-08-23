export type CreateWantRequest = {
  title: string;
  categories: string[];
  center: {
    longitude: number;
    latitude: number;
  };
  radius: number;
};
