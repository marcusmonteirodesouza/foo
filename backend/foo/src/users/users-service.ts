import {nanoid} from 'nanoid';
import {db} from '../db';
import {User} from './user';

type CreateUserOptions = {
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

  const document = db.doc(`/users/${user.id}`);

  await document.set({
    uid: user.uid,
  });

  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const document = db.doc(`/users/${id}`);

  const snapshot = await document.get();

  if (!snapshot.exists) {
    return;
  }

  return snapshot.data() as User;
}

async function getUserByUid(uid: string): Promise<User | undefined> {
  const collection = db.collection('users');

  const snapshot = await collection.where('uid', '==', uid).limit(1).get();

  if (snapshot.empty) {
    return;
  }

  return snapshot.docs[0].data() as User;
}
