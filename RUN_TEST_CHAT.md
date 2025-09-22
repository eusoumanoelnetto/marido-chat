Instruções para testar `test_chat.html` localmente:

1. Abra o arquivo `test_chat.html` no seu navegador (Chrome/Edge). Abra como arquivo local ou sirva com um servidor simples.

2. Se preferir servir via Node (recomendado), rode no PowerShell na pasta do projeto:

```powershell
npx http-server -c-1 . -p 8080
# ou, se quiser usar Python (se instalado):
# python -m http.server 8080
```

3. Acesse `http://localhost:8080/test_chat.html`.

4. Clique em `Start` para conectar (autenticação anônima) e comece a enviar mensagens.

Observações:
- Certifique-se que `firebase.js` está na raiz e tem suas credenciais (já criado).
- Se o browser bloquear o `module` import local por CORS, use o servidor acima.
