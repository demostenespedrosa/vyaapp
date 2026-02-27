/**
 * Gera a Declaração de Conteúdo em HTML e abre o diálogo de impressão/salvar PDF.
 */
export interface DeclarationData {
  // Remetente
  senderName: string;
  senderAddress?: string;
  senderCity?: string;
  senderState?: string;
  senderZip?: string;
  senderCpf?: string;
  // Destinatário
  recipientName: string;
  recipientAddress?: string;
  recipientCity?: string;
  recipientState?: string;
  recipientZip?: string;
  recipientCpf?: string;
  // Conteúdo
  description: string;
  size: string;
  // Referência
  packageId: string;
  date: string;
}

export function printDeclarationPdf(data: DeclarationData): void {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Declaração de Conteúdo – ${data.packageId}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; padding: 20px; }
    h1 { text-align:center; font-size:13pt; letter-spacing:4px; border-bottom:2px solid #000; padding-bottom:6px; margin-bottom:12px; }
    .logo { text-align:center; font-size:20pt; font-weight:900; letter-spacing:6px; margin-bottom:4px; }
    .section-title {
      letter-spacing:3px;
      font-size:7pt;
      font-weight:bold;
      background:#000;
      color:#fff;
      padding:3px 6px;
      margin:10px 0 6px;
    }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .field { margin-bottom:6px; }
    .field label { font-size:7pt; font-weight:bold; display:block; margin-bottom:1px; }
    .field .val { border-bottom:1px solid #000; min-height:14px; padding:1px 2px; font-size:8.5pt; }
    table { width:100%; border-collapse:collapse; margin-top:6px; }
    table th { border:1px solid #000; padding:4px 6px; font-size:7.5pt; text-align:left; background:#f0f0f0; }
    table td { border:1px solid #000; padding:5px 6px; font-size:8.5pt; min-height:18px; }
    .totals td { font-weight:bold; background:#f9f9f9; }
    .declaration { font-size:7.5pt; line-height:1.6; text-align:justify; margin:10px 0 16px; border:1px solid #ccc; padding:8px; border-radius:4px; background:#fafafa; }
    .sig-line { border-top:1px solid #000; width:60%; margin:0 auto; padding-top:4px; text-align:center; font-size:7.5pt; margin-top:32px; }
    .obs { font-size:7pt; margin-top:10px; border-top:1px solid #ccc; padding-top:6px; color:#444; }
    .ref { font-size:7pt; color:#666; text-align:right; margin-top:4px; }
    @media print {
      body { padding: 10px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="logo">VYA</div>
  <h1>DECLARAÇÃO DE CONTEÚDO</h1>
  <div class="ref">Ref.: ${data.packageId} · ${data.date}</div>

  <div class="grid-2">
    <div>
      <div class="section-title">R E M E T E N T E</div>
      <div class="field"><label>NOME:</label><div class="val">${data.senderName}</div></div>
      <div class="field"><label>ENDEREÇO:</label><div class="val">${data.senderAddress ?? ''}</div></div>
      <div class="field"><label>CIDADE:</label><div class="val">${data.senderCity ?? ''}</div></div>
      <div class="field"><label>UF:</label><div class="val">${data.senderState ?? ''}</div></div>
      <div class="field"><label>CEP:</label><div class="val">${data.senderZip ?? ''}</div></div>
      <div class="field"><label>CPF/CNPJ/DOC.ESTRANGEIRO:</label><div class="val">${data.senderCpf ?? ''}</div></div>
    </div>
    <div>
      <div class="section-title">D E S T I N A T Á R I O</div>
      <div class="field"><label>NOME:</label><div class="val">${data.recipientName}</div></div>
      <div class="field"><label>ENDEREÇO:</label><div class="val">${data.recipientAddress ?? ''}</div></div>
      <div class="field"><label>CIDADE:</label><div class="val">${data.recipientCity ?? ''}</div></div>
      <div class="field"><label>UF:</label><div class="val">${data.recipientState ?? ''}</div></div>
      <div class="field"><label>CEP:</label><div class="val">${data.recipientZip ?? ''}</div></div>
      <div class="field"><label>CPF/CNPJ/DOC.ESTRANGEIRO:</label><div class="val">${data.recipientCpf ?? ''}</div></div>
    </div>
  </div>

  <div class="section-title">I D E N T I F I C A Ç Ã O &nbsp; D O S &nbsp; B E N S</div>
  <table>
    <thead>
      <tr>
        <th style="width:32px">ITEM</th>
        <th>CONTEÚDO</th>
        <th style="width:60px">QUANT.</th>
        <th style="width:80px">VALOR (R$)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>1</td><td>${data.description}</td><td></td><td></td></tr>
      <tr><td>2</td><td></td><td></td><td></td></tr>
      <tr><td>3</td><td></td><td></td><td></td></tr>
      <tr class="totals">
        <td colspan="2" style="text-align:right">TOTAIS</td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <div class="field" style="margin-top:6px"><label>PESO TOTAL (kg):</label><div class="val" style="width:120px"></div></div>

  <div class="section-title">D E C L A R A Ç Ã O</div>
  <div class="declaration">
    Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/1996, uma vez que não realizo,
    com habitualidade ou em volume que caracterize intuito comercial, operações de circulação de mercadoria, ainda que se iniciem no exterior,
    ou estou dispensado da emissão da nota fiscal por força da legislação tributária vigente, responsabilizando-me, nos termos da lei e a
    quem de direito, por informações inverídicas.
    <br/><br/>
    Declaro que não envio objeto que ponha em risco o transporte, nem objeto proibido, assumindo responsabilidade pela informação prestada,
    e ciente de que o descumprimento pode configurar crime, conforme artigo 261 do Código Penal Brasileiro.
    <br/><br/>
    Declaro, ainda, estar ciente da lista de proibições e restrições, disponível no site da VYA.
  </div>

  <div class="sig-line">Assinatura do Declarante / Remetente</div>

  <div class="obs">
    <strong>OBSERVAÇÃO:</strong> Constitui crime contra a ordem tributária suprimir ou reduzir tributo, ou contribuição social e qualquer acessório
    (Lei 8.137/90 Art. 1º, V). Este documento deve ser impresso, preenchido a próprio punho e colado no pacote.
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=794,height=1123');
  if (!win) {
    alert('Permita pop-ups para baixar a declaração.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
