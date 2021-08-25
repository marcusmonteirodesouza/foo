import { nanoid } from 'nanoid';
import { usersService } from '../users';
import { db } from '../db';
import { Offer } from './offer';
import { AppError, CommonErrors } from '../error-management/errors';
import { Coordinates } from '../common/types';

const offersCollectionPath = 'offers';

export type CreateOfferOptions = {
  title: string;
  description?: string;
  categories: string[];
  center: Coordinates;
  radius: number;
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
    categories: options.categories,
    center: options.center,
    radius: options.radius,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...documentData } = offer;

  await db.doc(`/${offersCollectionPath}/${offer.id}`).set(documentData);

  return offer;
}

export async function getOfferById(id: string): Promise<Offer> {
  const snapshot = await db.doc(`/${offersCollectionPath}/${id}`).get();

  if (!snapshot.exists) {
    throw new AppError(CommonErrors.NotFound, `Offer ${id} not found`);
  }

  const documentData = snapshot.data() as Omit<Offer, 'id'>;

  return {
    id,
    ...documentData,
  };
}

export async function listOffersByUserId(userId: string): Promise<Offer[]> {
  const user = await usersService.getUserById(userId);

  if (!user) {
    throw new AppError(CommonErrors.NotFound, `User ${userId} not found`);
  }

  const snapshot = await db
    .collection(offersCollectionPath)
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map((doc) => {
    const documentData = doc.data() as Omit<Offer, 'id'>;
    return {
      id: doc.id,
      ...documentData,
    };
  });
}

export async function deleteOfferById(id: string): Promise<void> {
  const document = db.doc(`/${offersCollectionPath}/${id}`);

  const snapshot = await document.get();

  if (!snapshot.exists) {
    throw new AppError(CommonErrors.NotFound, `Offer ${id} not found`);
  }

  await document.delete();
}
