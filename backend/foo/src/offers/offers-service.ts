import {nanoid} from 'nanoid';
import {Offer} from './offer';

export async function createOffer(
  title: string,
  description?: string
): Promise<Offer> {
  const offer: Offer = {
    id: nanoid(),
    title,
    description,
  };

  return offer;
}
