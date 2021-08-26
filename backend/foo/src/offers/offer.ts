import { Location } from '../common/types';

export interface Offer {
  id: string;
  userId: string;
  title: string;
  description?: string;
  categories: string[];
  center: Location;
  radiusInMeters: number;
}
