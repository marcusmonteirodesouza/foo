export type CreateWantRequest = {
  title: string;
  center: {
    longitude: number;
    latitude: number;
  };
  radius: number;
};
