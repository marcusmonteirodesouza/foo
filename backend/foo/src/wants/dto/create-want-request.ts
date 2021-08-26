import { Coordinates } from '../../common/types';

export type CreateWantRequest = {
  title: string;
  categories: string[];
  center: Coordinates;
  radiusInMeters: number;
};
