/**
 * Cliente HTTP para a API Asaas.
 * Docs: https://docs.asaas.com/reference
 *
 * Variáveis de ambiente necessárias:
 *   ASAAS_API_KEY   — chave da conta Asaas (começa com $aact_...)
 *   ASAAS_BASE_URL  — https://sandbox.asaas.com (sandbox) ou https://api.asaas.com (produção)
 */

const ASAAS_BASE_URL =
  process.env.ASAAS_BASE_URL ?? 'https://sandbox.asaas.com';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY ?? '';

export async function asaasFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${ASAAS_BASE_URL}/api/v3${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'VYA App/1.0',
      access_token: ASAAS_API_KEY,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body = '';
    try {
      body = await res.text();
    } catch {}
    throw new Error(`Asaas API ${res.status} — ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Tipos Asaas (subset necessário) ─────────────────────────────────────────

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  billingType: string;
  dueDate: string;
  description: string;
  externalReference?: string;
}

export interface AsaasPix {
  encodedImage: string; // base64 do QR code
  payload: string;      // string copia-e-cola
  expirationDate: string;
}

export interface AsaasTransfer {
  id: string;
  status: string;
  value: number;
  transferType: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Busca ou cria um customer Asaas por CPF. */
export async function findOrCreateCustomer(params: {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}): Promise<string> {
  // Tenta encontrar pelo CPF
  const search = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${params.cpfCnpj.replace(/\D/g, '')}`
  );
  if (search.data.length > 0) return search.data[0].id;

  // Cria novo customer
  const created = await asaasFetch<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: params.name,
      cpfCnpj: params.cpfCnpj.replace(/\D/g, ''),
      email: params.email,
      phone: params.phone,
    }),
  });
  return created.id;
}

/** Cria um pagamento PIX no Asaas. */
export async function createPixPayment(params: {
  customerId: string;
  value: number;
  description: string;
  externalReference: string; // package ID
  dueDate: string; // YYYY-MM-DD
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: params.customerId,
      billingType: 'PIX',
      value: params.value,
      description: params.description,
      externalReference: params.externalReference,
      dueDate: params.dueDate,
    }),
  });
}

/** Obtém o QR Code de um pagamento PIX. */
export async function getPixQrCode(paymentId: string): Promise<AsaasPix> {
  return asaasFetch<AsaasPix>(`/payments/${paymentId}/pixQrCode`);
}

/** Dispara uma transferência via PIX (saque do viajante). */
export async function createTransfer(params: {
  value: number;
  pixAddressKey: string;
  pixAddressKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  description?: string;
}): Promise<AsaasTransfer> {
  return asaasFetch<AsaasTransfer>('/transfers', {
    method: 'POST',
    body: JSON.stringify({
      value: params.value,
      operationType: 'PIX',
      pixAddressKey: params.pixAddressKey,
      pixAddressKeyType: params.pixAddressKeyType,
      description: params.description ?? 'Repasse VYA',
    }),
  });
}
