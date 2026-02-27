# Guia de Setup — Integração Asaas (PIX)

Este guia cobre tudo que precisa ser feito para colocar o sistema de pagamentos PIX do VYA em funcionamento, do zero até a produção.

---

## Índice

1. [Criar conta no Asaas](#1-criar-conta-no-asaas)
2. [Obter a API Key](#2-obter-a-api-key)
3. [Configurar as variáveis de ambiente](#3-configurar-as-variáveis-de-ambiente)
4. [Executar a migration do banco de dados](#4-executar-a-migration-do-banco-de-dados)
5. [Configurar o Webhook no painel Asaas](#5-configurar-o-webhook-no-painel-asaas)
6. [Testar em Sandbox](#6-testar-em-sandbox)
7. [Ir para Produção](#7-ir-para-producao)
8. [Checklist final](#8-checklist-final)

---

## 1. Criar conta no Asaas

### Sandbox (desenvolvimento e testes)

1. Acesse **[sandbox.asaas.com](https://sandbox.asaas.com)**
2. Clique em **"Criar conta gratuita"**
3. Preencha os dados (pode usar CPF/CNPJ fictício no sandbox)
4. Confirme o e-mail e faça login

> **Atenção:** O sandbox é completamente isolado da produção. Dados, pagamentos e transferências são fictícios — nenhum dinheiro real é movimentado.

### Produção

1. Acesse **[www.asaas.com](https://www.asaas.com)**
2. Crie a conta com os dados reais da empresa/pessoa física responsável pelo VYA
3. Complete a verificação de identidade (KYC) para liberar transferências PIX
4. Aguarde a aprovação (geralmente 1–2 dias úteis)

---

## 2. Obter a API Key

1. Faça login na sua conta Asaas (sandbox ou produção)
2. No menu superior, clique em **"Minha Conta"** (ícone de usuário)
3. Vá em **Configurações → Integrações**
4. Na seção **"Chave de API"**, clique em **"Gerar chave"**

   A chave tem o formato:
   ```
   $aact_YTU5YTE0M2M2N2I4MTdmZjM0...
   ```

5. **Copie a chave imediatamente** — ela não é exibida novamente após sair da tela
6. Guarde em local seguro (jamais commite no Git)

---

## 3. Configurar as variáveis de ambiente

### Passo a passo

1. Na raiz do projeto, copie o arquivo de exemplo:

   ```bash
   cp .env.local.example .env.local
   ```

2. Abra `.env.local` e preencha:

   ```dotenv
   # Supabase (já deve estar preenchido)
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...

   # Asaas — Sandbox
   ASAAS_BASE_URL=https://sandbox.asaas.com
   ASAAS_API_KEY=$aact_...

   # Token para validar webhooks (você inventa um texto secreto qualquer)
   ASAAS_WEBHOOK_TOKEN=meu-token-secreto-123
   ```

3. Reinicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

### Onde ficam cada variável

| Variável | Usada em | Visível no navegador? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + Servidor | ✅ Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend + Servidor | ✅ Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor (rotas de API) | ❌ Não |
| `ASAAS_BASE_URL` | Somente servidor | ❌ Não |
| `ASAAS_API_KEY` | Somente servidor | ❌ Não |
| `ASAAS_WEBHOOK_TOKEN` | Somente servidor | ❌ Não |

> As variáveis **sem** `NEXT_PUBLIC_` no prefixo nunca chegam ao navegador — o Next.js garante isso automaticamente.

---

## 4. Executar a migration do banco de dados

O arquivo `supabase-migration-payments.sql` adiciona as tabelas e colunas necessárias para o sistema de pagamentos.

### Via painel Supabase (recomendado)

1. Acesse **[supabase.com](https://supabase.com)** → seu projeto → **SQL Editor**
2. Clique em **"New query"**
3. Abra o arquivo local `supabase-migration-payments.sql` e cole o conteúdo inteiro
4. Clique em **"Run"** (▶)
5. Verifique se todas as queries foram executadas sem erros

### Via Supabase CLI (alternativo)

```bash
supabase db push --db-url postgresql://postgres:SENHA@db.SEU-PROJETO.supabase.co:5432/postgres < supabase-migration-payments.sql
```

### O que a migration cria

| Alteração | Descrição |
|---|---|
| `ALTER TABLE packages` | Adiciona `asaas_payment_id`, `pix_qr_code`, `pix_copy_paste`, `expires_at` e o status `waiting_payment` |
| `CREATE TABLE wallets` | Carteira interna por usuário (`pending_balance`, `available_balance`, `total_earned`) |
| `CREATE TABLE wallet_transactions` | Extrato de créditos e saques |
| `FUNCTION upsert_wallet_credit` | Cria/atualiza carteira e registra crédito ao viajante |
| `FUNCTION release_pending_to_available` | Libera saldo pendente para disponível (chamada manualmente pelo admin) |
| Políticas RLS | Cada usuário vê e edita somente os próprios dados |

---

## 5. Configurar o Webhook no painel Asaas

O webhook é chamado pelo Asaas quando um PIX é confirmado. Sem ele, o status do pacote nunca muda para `waiting_pickup`.

### URL do webhook

```
https://SEU-DOMINIO.com/api/webhooks/asaas
```

Durante o desenvolvimento local, use um serviço de túnel:

```bash
# Instalar ngrok (se não tiver)
npm install -g ngrok

# Expor a porta 3000 (ou a que usar)
ngrok http 3000
```

O ngrok gera uma URL temporária como `https://abc123.ngrok-free.app`. Use-a como base.

### Configuração no painel Asaas

1. Faça login no Asaas → **Minha Conta → Configurações**
2. Clique em **"Webhooks"** no menu lateral
3. Clique em **"Adicionar"**
4. Preencha:
   - **URL:** `https://SEU-DOMINIO.com/api/webhooks/asaas`
   - **Token de autenticação:** o mesmo valor definido em `ASAAS_WEBHOOK_TOKEN` no `.env.local`
   - **Eventos a monitorar:** marque somente ✅ **PAYMENT_RECEIVED** e ✅ **PAYMENT_CONFIRMED**
5. Clique em **"Salvar"**
6. Use o botão **"Testar"** para enviar um evento de teste e confirmar que a URL está acessível

### Como o webhook é validado no código

O servidor (`src/app/api/webhooks/asaas/route.ts`) verifica o header `asaas-access-token`:

```
asaas-access-token: SEU_ASAAS_WEBHOOK_TOKEN
```

Se o token não bater, a requisição recebe `401 Unauthorized` e é ignorada.

---

## 6. Testar em Sandbox

### Criar um pagamento de teste

1. O viajante aceita um pacote no app → a API cria uma cobrança PIX no Asaas Sandbox
2. Copie o `asaas_payment_id` retornado (ou veja no painel Asaas → Cobranças)

### Simular um pagamento recebido manualmente

No painel Asaas Sandbox, abra a cobrança e clique em **"Simular pagamento"**. Isso dispara o webhook automaticamente.

**Ou** dispare o webhook manualmente pelo terminal:

```bash
curl -X POST https://SEU-DOMINIO.com/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: meu-token-secreto-123" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_XXXXXXXXXXXXXXXX",
      "status": "RECEIVED",
      "value": 45.90,
      "externalReference": "UUID-DO-PACOTE-NO-SUPABASE"
    }
  }'
```

### O que verificar após o teste

| Verificação | Onde checar |
|---|---|
| Pacote mudou para `waiting_pickup` | Supabase → tabela `packages` |
| Carteira do viajante foi creditada | Supabase → tabela `wallets` |
| Transação registrada | Supabase → tabela `wallet_transactions` |
| Notificação criada para o remetente | Supabase → tabela `notifications` |
| Checkout fechou no app do remetente | App → realtime via Supabase |

### Testar o saque (viajante)

1. No Supabase, execute manualmente para liberar o saldo pendente:

   ```sql
   SELECT public.release_pending_to_available(
     (SELECT id FROM wallets WHERE user_id = 'UUID-DO-VIAJANTE')
   );
   ```

2. No app, acesse a tab **Carteira** → clique em **"Sacar via PIX"**
3. No Sandbox, o saque aparece em **Transferências** no painel Asaas

---

## 7. Ir para Produção

### Alterações necessárias

1. **`.env.local` (ou variáveis no servidor de deploy):**

   ```dotenv
   ASAAS_BASE_URL=https://api.asaas.com   # ← muda de sandbox para produção
   ASAAS_API_KEY=$aact_...                 # ← chave da conta de PRODUÇÃO
   ASAAS_WEBHOOK_TOKEN=token-muito-seguro  # ← token diferente do sandbox
   ```

2. **Webhook em produção:**
   - No painel Asaas de produção, cadastrar a URL definitiva (ex.: `https://vyaapp.com/api/webhooks/asaas`)
   - Usar um `ASAAS_WEBHOOK_TOKEN` diferente do sandbox

3. **Domínio do deploy:**
   - A URL do webhook precisa ser HTTPS e acessível publicamente
   - No Vercel/Railway/Render isso já é garantido automaticamente

### Variáveis no Vercel (exemplo)

```
# Painel Vercel → Settings → Environment Variables
ASAAS_BASE_URL         = https://api.asaas.com
ASAAS_API_KEY          = $aact_...
ASAAS_WEBHOOK_TOKEN    = seu-token-producao
SUPABASE_SERVICE_ROLE_KEY = eyJ...
```

### Antes de ir ao ar

- [ ] Conta Asaas aprovada (KYC completo)
- [ ] Chave PIX da conta VYA cadastrada no Asaas (para receber os pagamentos)
- [ ] Migration executada no banco de **produção**
- [ ] Webhook cadastrado com a URL de produção e testado com "Simular"
- [ ] Variáveis de ambiente corretas no servidor de deploy
- [ ] Teste de ponta a ponta: remetente cria envio → viajante aceita → PIX gerado → pagamento simulado → webhook confirma → status muda

---

## 8. Checklist final

```
SANDBOX
  [_] Conta sandbox criada em sandbox.asaas.com
  [_] API Key copiada e salva em .env.local (ASAAS_API_KEY)
  [_] ASAAS_BASE_URL=https://sandbox.asaas.com
  [_] ASAAS_WEBHOOK_TOKEN definido
  [_] Migration supabase-migration-payments.sql executada
  [_] Webhook cadastrado no painel sandbox (URL ngrok ou staging)
  [_] Pagamento de teste simulado com sucesso
  [_] Carteira do viajante creditada corretamente
  [_] Saque executado com sucesso

PRODUÇÃO
  [_] Conta produção aprovada (KYC completo)
  [_] API Key de produção obtida
  [_] ASAAS_BASE_URL=https://api.asaas.com
  [_] Variáveis atualizadas no servidor de deploy
  [_] Migration executada no banco de produção
  [_] Webhook de produção cadastrado com URL definitiva
  [_] Chave PIX da conta VYA configurada no Asaas
  [_] Teste de ponta a ponta em produção aprovado
```

---

## Referências

- [Documentação oficial Asaas](https://docs.asaas.com/reference)
- [Painel Sandbox](https://sandbox.asaas.com)
- [Painel Produção](https://app.asaas.com)
- [Status da API Asaas](https://status.asaas.com)
- Código do webhook: `src/app/api/webhooks/asaas/route.ts`
- Código da geração PIX: `src/app/api/payments/generate-pix/route.ts`
- Código do saque: `src/app/api/wallet/withdraw/route.ts`
- Cliente HTTP Asaas: `src/lib/asaas.ts`
