import {Coordinates} from '../common/types';

export interface Want {
  id: string;
  userId: string;
  title: string;
  center: Coordinates;
  radius: number;
}
