import { Location } from '../common/types';

export interface Want {
  id: string;
  userId: string;
  title: string;
  categories: string[];
  center: Location;
  radiusInMeters: number;
}
