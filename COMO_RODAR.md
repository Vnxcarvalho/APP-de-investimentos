# BNE Investimentos — Como Rodar

## 1. Instalar Node.js

Baixe e instale em: https://nodejs.org (versão LTS recomendada)

## 2. Instalar dependências

Abra o terminal nesta pasta e rode:

```bash
npm install
```

## 3. Configurar Firebase

1. Acesse https://console.firebase.google.com
2. Crie um novo projeto
3. Em **Authentication** → ative Email/Senha e Google OK
4. Em **Firestore Database** → crie um banco em modo de produção OK 
5. Em **Configurações do projeto** → copie as credenciais do app web 

6. Crie um arquivo `.env` (copie de `.env.example`):

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_BRAPI_TOKEN=
```

> **BRAPI_TOKEN**: Opcional. Sem token funciona com limite de requests.  
> Para mais chamadas, cadastre em https://brapi.dev e gere um token grátis.

## 4. Regras do Firestore

No console Firebase → Firestore → Regras, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Rodar o app

```bash
npm run dev
```

Acesse http://localhost:5173

## 6. Build para produção

```bash
npm run build
```

## Funcionalidades

- **Dashboard**: visão geral da carteira, alocação por tipo e retorno por ativo
- **Portfólio**: todos os ativos com cotação em tempo real (B3 via brapi.dev)
- **Operações**: registro de compras e vendas com cálculo automático de preço médio
- **Autenticação**: login com email/senha ou Google
- **Tipos de ativo**: Ação, FII, Renda Fixa, Cripto, Exterior
