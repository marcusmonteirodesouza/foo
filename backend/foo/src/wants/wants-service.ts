import {db} from '../db';
import {Coordinates} from '../common/types';
import {usersService} from '../users';
import {AppError, CommonErrors} from '../error-management/errors';
import {Want} from './want';
import {nanoid} from 'nanoid';

type CreateWantOptions = {
  title: string;
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

  const want: Want = {
    id: nanoid(),
    userId: user.id,
    title: options.title,
    center: options.center,
    radius: options.radius,
  };

  const document = db.doc(`/wants/${want.id}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {id, ...documentData} = want;

  await document.set(documentData);

  return want;
}

export async function listWantsByUserId(userId: string): Promise<Want[]> {
  const user = await usersService.getUserById(userId);

  if (!user) {
    throw new AppError(CommonErrors.NotFound, `User ${userId} not found`);
  }

  const collection = db.collection('wants');

  const snapshot = await collection.where('userId', '==', userId).get();

  return snapshot.docs.map(doc => {
    const documentData = doc.data() as Omit<Want, 'id'>;
    return {
      id: doc.id,
      ...documentData,
    };
  });
}
