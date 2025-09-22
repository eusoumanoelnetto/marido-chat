# Guia Rápido: Chat com Firebase (Marido-Chat)

Este guia descreve como integrar um chat simples usando Firebase Firestore, autenticação anônima e notificações.

## 1) Pré-requisitos

- Projeto Firebase criado (você disse que já criou).
- Firestore habilitado (modo de teste ou regras restritas conforme suas necessidades).
- `firebase` instalado no projeto (`npm install firebase`).
- Arquivo `firebase.js` na raiz com a configuração do seu projeto.

## 2) Arquivos que adicionei

- `firebase.js` - inicializa app, exporta `db` e `auth`.
- `src/components/Chat.jsx` - componente React simples para enviar/receber mensagens.
- `src/services/chatService.js` - helpers para autenticação anônima, envio e listener.

## 3) Estrutura de dados recomendada

Coleções e documentos:

- `messages/{chatId}/{messageId}`
  - `text`: string
  - `senderId`: string|null
  - `createdAt`: timestamp (serverTimestamp)

Observação: usar subcoleções por `chatId` facilita consultas e regras.

## 4) Uso rápido no React

- Importar componente:

```jsx
import Chat from './src/components/Chat';

function App(){
  return <Chat chatId="cliente-123_prestador-456" />;
}
```

- Ou usar o serviço:

```js
import { listenMessages, sendMessage } from './src/services/chatService';

const unsub = listenMessages('chat-1', (msgs) => console.log(msgs));
await sendMessage('chat-1', 'Olá');
```

## 5) Regras de segurança Firestore (exemplo)

Cole no console do Firebase > Firestore > Regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{chatId}/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.keys().hasAll(['text','createdAt']) && request.resource.data.text is string;
      allow update, delete: if false; // não permitir alterações
    }
  }
}
```

A regra acima exige autenticação para leitura e escrita. Para permitir usuários anônimos, não altere o método de autenticação (eles também geram `request.auth`). Ajuste conforme suas necessidades.

## 6) Notificações Push (opcional)

- Use Firebase Cloud Messaging (FCM).
- Para enviar notificações quando uma mensagem chegar, crie uma Cloud Function (Node.js) que observe a coleção `messages/{chatId}/{messageId}` e dispare `admin.messaging().sendToTopic()` ou `sendToDevice()`.

## 7) Deploy e observações

- Frontend: pode hospedar no Vercel ou Firebase Hosting.
- Se for usar Vercel e precisar de background real-time, prefira Firebase + Cloud Functions para notificações, e Firestore para sync.

---

Se quiser, eu posso:
- Implementar o Cloud Function de notificação.
- Ajustar o `Chat.jsx` ao estilo do seu app (CSS, layout, avatars).
- Adicionar paginação e carregamento histórico.

Diga o que prefere que eu faça a seguir.
