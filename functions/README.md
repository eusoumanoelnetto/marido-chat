# Cloud Functions - Marido-Chat

Funções:

- `onMessageCreate` (Firestore trigger): quando uma nova mensagem é criada em `messages/{chatId}/{messageId}`, envia notificação FCM para o tópico `chat-{chatId}`.
- `api/subscribe` (HTTP): subscreve um token FCM a um tópico `chat-{chatId}`.
- `api/unsubscribe` (HTTP): remove a subscrição.

Pré-requisitos para deploy:

1. Instale Firebase CLI (`npm i -g firebase-tools`) e faça login (`firebase login`).
2. No diretório `functions`, rode `npm install`.
3. No root do projeto, rode `firebase init` e selecione `Functions` e `Firestore` (apenas se ainda não tiver inicializado).
4. Deploy:

```bash
# na raiz do projeto
firebase deploy --only functions
```

Uso no cliente:

- Obtenha o token FCM (web) e chame `POST https://<REGION>-<PROJECT>.cloudfunctions.net/api/subscribe` com JSON `{ token, chatId }`.

Segurança:
- Proteja o endpoint de subscribe com verificação de usuário/autenticação se necessário, ou limite por CORS.
