import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../../firebase';

export async function ensureAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.warn('anonymous auth failed', err);
      throw err;
    }
  }
  return auth.currentUser;
}

export function listenMessages(chatId = 'default-chat', cb) {
  const messagesRef = collection(db, 'messages', chatId);
  const q = query(messagesRef, orderBy('createdAt'), limit(200));
  const unsub = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    cb(msgs);
  }, (err) => {
    console.error('listenMessages error', err);
  });
  return unsub;
}

export async function sendMessage(chatId = 'default-chat', text) {
  await ensureAuth();
  return addDoc(collection(db, 'messages', chatId), {
    text,
    senderId: auth.currentUser?.uid || null,
    createdAt: serverTimestamp(),
  });
}
