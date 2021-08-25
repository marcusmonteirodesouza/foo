import { nanoid } from 'nanoid';
import { db } from '../db';
import { User } from './user';

const usersCollectionPath = 'users';

export type CreateUserOptions = {
  uid: string;
};

export async function getOrCreateUser(
  options: CreateUserOptions
): Promise<User> {
  let user = await getUserByUid(options.uid);

  if (user) {
    return user;
  }

  user = {
    id: nanoid(),
    uid: options.uid,
  };

  const document = db.doc(`/${usersCollectionPath}/${user.id}`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...documentData } = user;

  await document.set(documentData);

  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const snapshot = await db.doc(`/${usersCollectionPath}/${id}`).get();

  if (!snapshot.exists) {
    return;
  }

  const documentData = snapshot.data() as Omit<User, 'id'>;

  return {
    id,
    ...documentData,
  };
}

async function getUserByUid(uid: string): Promise<User | undefined> {
  const snapshot = await db
    .collection(usersCollectionPath)
    .where('uid', '==', uid)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return;
  }

  const document = snapshot.docs[0];

  const documentData = snapshot.docs[0].data() as Omit<User, 'id'>;

  return {
    id: document.id,
    ...documentData,
  };
}
