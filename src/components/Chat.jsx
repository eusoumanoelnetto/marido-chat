import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { getFCMToken, subscribeTokenToChatServer, onForegroundMessage } from '../services/fcmService';

export default function Chat({ chatId = 'default-chat', vapidKey = null, functionsApiUrl = null }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    let unsub;
    async function init() {
      setLoading(true);
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn('Sign-in anonymous failed', err);
        }
      }

      const messagesRef = collection(db, 'messages', chatId);
      const q = query(messagesRef, orderBy('createdAt'), limit(200));
      unsub = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setLoading(false);
        // scroll to bottom
        setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
      }, (err) => {
        console.error('messages onSnapshot error', err);
        setLoading(false);
      });

      // optional FCM subscription: try get token and subscribe to topic
      if (vapidKey && functionsApiUrl) {
        try {
          const token = await getFCMToken(vapidKey);
          if (token) {
            await subscribeTokenToChatServer(functionsApiUrl, token, chatId);
            setSubscribed(true);
            onForegroundMessage((payload) => {
              console.log('Mensagem FCM em foreground', payload);
            });
          }
        } catch (err) {
          console.warn('FCM subscription failed', err);
        }
      }
    }

    init();
    return () => { if (unsub) unsub(); };
  }, [chatId, vapidKey, functionsApiUrl]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addDoc(collection(db, 'messages', chatId), {
        text: text.trim(),
        senderId: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      console.error('Erro ao enviar mensagem', err);
    }
  }

  return (
    <div className="chat" style={{border:'1px solid #eee', padding:12, borderRadius:8}}>
      <div ref={listRef} className="messages" style={{maxHeight:300, overflowY:'auto', marginBottom:8}}>
        {loading && <div style={{color:'#666', padding:8}}>Carregando...</div>}
        {!loading && messages.length === 0 && <div style={{color:'#666', padding:8}}>Nenhuma mensagem ainda.</div>}
        {messages.map(m => (
          <div key={m.id} style={{padding:8, background: m.senderId === auth.currentUser?.uid ? '#e6ffe6' : '#fff', margin:4, borderRadius:6}}>
            <div style={{fontSize:12, color:'#666', marginBottom:4}}>{m.senderId ? (m.senderId === auth.currentUser?.uid ? 'Você' : 'Outro') : 'Anônimo'}</div>
            <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
            <div style={{fontSize:10, color:'#999', marginTop:6}}>{m.createdAt && m.createdAt.toDate ? new Date(m.createdAt.toDate()).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{display:'flex', gap:8}}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Digite uma mensagem..." style={{flex:1, padding:8, borderRadius:6, border:'1px solid #ddd'}} />
        <button type="submit" style={{padding:'8px 12px', borderRadius:6}}>Enviar</button>
      </form>

      {vapidKey && functionsApiUrl && (
        <div style={{marginTop:8, fontSize:12, color: subscribed ? '#2a7' : '#666'}}>
          {subscribed ? 'Inscrito para notificações push' : 'Tentando inscrever para notificações...'}
        </div>
      )}
    </div>
  );
}
