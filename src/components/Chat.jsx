import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export default function Chat({ chatId = 'default-chat' }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    let unsub;
    async function init() {
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
      }, (err) => {
        console.error('messages onSnapshot error', err);
      });
    }

    init();
    return () => { if (unsub) unsub(); };
  }, [chatId]);

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
      <div className="messages" style={{maxHeight:300, overflowY:'auto', marginBottom:8}}>
        {messages.map(m => (
          <div key={m.id} style={{padding:8, background: m.senderId === auth.currentUser?.uid ? '#e6ffe6' : '#fff', margin:4, borderRadius:6}}>
            <div style={{fontSize:12, color:'#666', marginBottom:4}}>{m.senderId ? (m.senderId === auth.currentUser?.uid ? 'Você' : 'Outro') : 'Anônimo'}</div>
            <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
            <div style={{fontSize:10, color:'#999', marginTop:6}}>{m.createdAt && m.createdAt.toDate ? m.createdAt.toDate().toLocaleString() : ''}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{display:'flex', gap:8}}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Digite uma mensagem..." style={{flex:1, padding:8, borderRadius:6, border:'1px solid #ddd'}} />
        <button type="submit" style={{padding:'8px 12px', borderRadius:6}}>Enviar</button>
      </form>
    </div>
  );
}
