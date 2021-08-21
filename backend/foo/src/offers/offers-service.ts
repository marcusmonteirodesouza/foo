import {nanoid} from 'nanoid';
import {db} from '../db';
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

  const document = db.doc(`/offers/${offer.id}`);

  await document.set({
    title: offer.title,
    description: offer.description,
  });

  return offer;
}
