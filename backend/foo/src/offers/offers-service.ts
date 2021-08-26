import { nanoid } from 'nanoid';
import * as geofire from 'geofire-common';
import { Coordinates } from '../common/types';
import { usersService } from '../users';
import { db } from '../db';
import { wantsService } from '../wants';
import { Offer } from './offer';
import { AppError, CommonErrors } from '../error-management/errors';

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

  const geohash = geofire.geohashForLocation([
    options.center.latitude,
    options.center.longitude,
  ]);

  const offer: Offer = {
    id: nanoid(),
    userId,
    title: options.title,
    description: options.description,
    categories: options.categories,
    center: {
      ...options.center,
      geohash,
    },
    radiusInMeters: options.radius,
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

export async function listOffersByWantId(wantId: string): Promise<Offer[]> {
  const want = await wantsService.getWantById(wantId);

  if (!want) {
    throw new AppError(CommonErrors.NotFound, `Want ${wantId} not found`);
  }

  const bounds = geofire.geohashQueryBounds(
    [want.center.latitude, want.center.longitude],
    want.radiusInMeters
  );

  const promises = [];
  for (const b of bounds) {
    const offersInWantRadiusQuery = db
      .collection(offersCollectionPath)
      .orderBy('center.geohash')
      .startAt(b[0])
      .endAt(b[1]);

    promises.push(offersInWantRadiusQuery.get());
  }

  const offersInWantRadiusSnapshots = await Promise.all(promises);

  return offersInWantRadiusSnapshots
    .map((snapshot) => {
      return snapshot.docs.map((document): Offer => {
        return {
          id: document.id,
          ...(document.data() as Omit<Offer, 'id'>),
        };
      });
    })
    .flat()
    .filter((offer) => {
      const offerLocation = [offer.center.latitude, offer.center.longitude];
      const wantLocation = [want.center.latitude, want.center.longitude];
      const distanceInMeters =
        geofire.distanceBetween(offerLocation, wantLocation) * 1000;
      return (
        distanceInMeters <= offer.radiusInMeters &&
        distanceInMeters <= want.radiusInMeters
      );
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
