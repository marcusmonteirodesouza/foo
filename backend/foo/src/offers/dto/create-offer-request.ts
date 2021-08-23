import {Coordinates} from '../../common/types';

export type CreateOfferRequest = {
  title: string;
  description: string;
  center: Coordinates;
  radius: number;
};
