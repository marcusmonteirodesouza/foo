import {Firestore} from '@google-cloud/firestore';

const db = new Firestore();

db.settings({ignoreUndefinedProperties: true});

export {db};
