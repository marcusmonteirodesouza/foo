import { Coordinates } from '../coordinates';

export interface Location extends Coordinates {
  geohash: string;
}
