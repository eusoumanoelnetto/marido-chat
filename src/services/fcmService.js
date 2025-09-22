import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { auth } from '../../firebase';

export async function getFCMToken(vapidKey) {
  try {
    const messaging = getMessaging();
    const currentToken = await getToken(messaging, { vapidKey });
    return currentToken;
  } catch (err) {
    console.warn('getFCMToken error', err);
    return null;
  }
}

export function onForegroundMessage(cb) {
  const messaging = getMessaging();
  onMessage(messaging, (payload) => cb(payload));
}

export async function subscribeTokenToChatServer(apiUrl, token, chatId) {
  const resp = await fetch(apiUrl + '/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, chatId })
  });
  return resp.json();
}
