import { Coordinates } from '../../common/types';

export type CreateOfferRequest = {
  title: string;
  description?: string;
  categories: string[];
  center: Coordinates;
  radius: number;
};
