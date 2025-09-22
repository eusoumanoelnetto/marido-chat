const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Trigger: quando nova mensagem é criada, envia notificação para tópico do chat
exports.onMessageCreate = functions.firestore
  .document('messages/{chatId}/{messageId}')
  .onCreate(async (snap, context) => {
    const chatId = context.params.chatId;
    const data = snap.data();
    const text = data.text || '';

    const payload = {
      notification: {
        title: 'Nova mensagem',
        body: text.length > 120 ? text.substring(0, 117) + '...' : text,
      },
      data: {
        chatId,
        messageId: context.params.messageId,
      }
    };

    try {
      const topic = `chat-${chatId}`;
      const response = await admin.messaging().sendToTopic(topic, payload);
      console.log('Notificação enviada para topic', topic, response);
    } catch (err) {
      console.error('Erro ao enviar notificação', err);
    }
  });

// HTTP endpoint para subscrever token a tópico
app.post('/subscribe', async (req, res) => {
  const { token, chatId } = req.body || {};
  if (!token || !chatId) return res.status(400).json({ error: 'token and chatId required' });
  try {
    const topic = `chat-${chatId}`;
    const resp = await admin.messaging().subscribeToTopic([token], topic);
    return res.json({ success: true, resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// HTTP endpoint para unsubscribing (opcional)
app.post('/unsubscribe', async (req, res) => {
  const { token, chatId } = req.body || {};
  if (!token || !chatId) return res.status(400).json({ error: 'token and chatId required' });
  try {
    const topic = `chat-${chatId}`;
    const resp = await admin.messaging().unsubscribeFromTopic([token], topic);
    return res.json({ success: true, resp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

exports.api = functions.https.onRequest(app);
