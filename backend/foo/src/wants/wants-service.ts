import { nanoid } from 'nanoid';
import * as geofire from 'geofire-common';
import { db } from '../db';
import { Coordinates } from '../common/types';
import { usersService } from '../users';
import { AppError, CommonErrors } from '../error-management/errors';
import { Want } from './want';

const wantsCollectionPath = 'wants';

export type CreateWantOptions = {
  title: string;
  categories: string[];
  center: Coordinates;
  radius: number;
};

export async function createWant(
  userId: string,
  options: CreateWantOptions
): Promise<Want> {
  const user = await usersService.getUserById(userId);

  if (!user) {
    throw new AppError(CommonErrors.NotFound, `User ${userId} not found`);
  }

  const geohash = geofire.geohashForLocation([
    options.center.latitude,
    options.center.longitude,
  ]);

  const want: Want = {
    id: nanoid(),
    userId: user.id,
    title: options.title,
    categories: options.categories,
    center: {
      ...options.center,
      geohash,
    },
    radiusInMeters: options.radius,
  };

  const document = db.doc(`/${wantsCollectionPath}/${want.id}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...documentData } = want;

  await document.set(documentData);

  return want;
}

export async function getWantById(id: string): Promise<Want | undefined> {
  const snapshot = await db.doc(`/${wantsCollectionPath}/${id}`).get();

  if (!snapshot.exists) {
    return;
  }

  const documentData = snapshot.data() as Omit<Want, 'id'>;

  return {
    id,
    ...documentData,
  };
}

export async function listWantsByUserId(userId: string): Promise<Want[]> {
  const user = await usersService.getUserById(userId);

  if (!user) {
    throw new AppError(CommonErrors.NotFound, `User ${userId} not found`);
  }

  const snapshot = await db
    .collection(wantsCollectionPath)
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map((doc) => {
    const documentData = doc.data() as Omit<Want, 'id'>;
    return {
      id: doc.id,
      ...documentData,
    };
  });
}

export async function deleteWantById(id: string): Promise<void> {
  const document = db.doc(`/${wantsCollectionPath}/${id}`);

  const snapshot = await document.get();

  if (!snapshot.exists) {
    throw new AppError(CommonErrors.NotFound, `Want ${id} not found`);
  }

  await document.delete();
}
