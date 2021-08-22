import {nanoid} from 'nanoid';
import {usersService} from '../users';
import {db} from '../db';
import {Offer} from './offer';
import {AppError, CommonErrors} from '../error-management/errors';

type CreateOfferOptions = {
  title: string;
  description?: string;
};

export async function createOffer(
  userId: string,
  options: CreateOfferOptions
): Promise<Offer> {
  const user = await usersService.getUserById(userId);

  if (!user) {
    throw new AppError(CommonErrors.NotFound, `User ${userId} not found`);
  }

  const offer: Offer = {
    id: nanoid(),
    userId,
    title: options.title,
    description: options.description,
  };

  const document = db.doc(`/offers/${offer.id}`);

  await document.set({
    userId,
    title: offer.title,
    description: offer.description,
  });

  return offer;
}
