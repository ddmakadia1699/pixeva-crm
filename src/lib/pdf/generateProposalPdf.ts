import { Enquiry } from '@/lib/supabase/types';
import { formatCurrency } from '@/lib/utils';

export function generateProposalHtml(enquiry: Enquiry): string {
  const proposalId = `PIX-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const budget = enquiry.estimated_budget || 200000;
  const advance = Math.round(budget * 0.2);
  const eventDay = Math.round(budget * 0.6);
  const finalBal = Math.round(budget * 0.2);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Photography Proposal - ${enquiry.name} - ${proposalId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 40px 50px;
      line-height: 1.5;
      font-size: 13px;
    }

    @media print {
      body {
        padding: 20px 30px;
      }
      .no-print {
        display: none !important;
      }
    }

    .header-table {
      width: 100%;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }

    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #0369a1;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      margin-top: 2px;
    }

    .doc-meta {
      text-align: right;
    }

    .doc-meta h2 {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }

    .doc-meta p {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .client-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
    }

    .client-col h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0284c7;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .client-col p {
      font-size: 12px;
      color: #334155;
      margin-bottom: 3px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      border-left: 4px solid #0284c7;
      padding-left: 10px;
      margin: 25px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    table.services-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    table.services-table th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 10px 14px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #cbd5e1;
    }

    table.services-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      color: #1e293b;
    }

    table.services-table tr:last-child td {
      border-bottom: none;
    }

    .pricing-summary {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
    }

    .pricing-box {
      width: 320px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 16px 20px;
    }

    .pricing-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
      color: #334155;
    }

    .pricing-row.total {
      border-top: 2px solid #0284c7;
      padding-top: 8px;
      margin-top: 8px;
      font-size: 15px;
      font-weight: 800;
      color: #0369a1;
    }

    .terms-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
      margin-top: 25px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
    }

    .sig-block {
      width: 220px;
      border-top: 1px solid #94a3b8;
      padding-top: 8px;
      text-align: center;
      font-size: 11px;
      color: #475569;
    }

    .btn-bar {
      position: fixed;
      top: 15px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 100;
    }

    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }
  </style>
</head>
<body>

  <div class="btn-bar no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <table class="header-table">
    <tr>
      <td>
        <div class="brand-title">PIXEVA STUDIO</div>
        <div class="brand-subtitle">AI Photography & Cinematic Production</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          hello@pixeva.co • www.pixeva.app • +91 89048 32762
        </div>
      </td>
      <td class="doc-meta">
        <h2>OFFICIAL PROPOSAL</h2>
        <p><strong>Proposal Ref:</strong> ${proposalId}</p>
        <p><strong>Issue Date:</strong> ${dateStr}</p>
        <p><strong>Status:</strong> Valid for 14 Days</p>
      </td>
    </tr>
  </table>

  <div class="client-card">
    <div class="client-col">
      <h4>Client Information</h4>
      <p><strong>Name:</strong> ${enquiry.name}</p>
      <p><strong>Email:</strong> ${enquiry.email || 'N/A'}</p>
      <p><strong>Contact:</strong> ${enquiry.phone || enquiry.contact || 'N/A'}</p>
    </div>
    <div class="client-col" style="text-align: right;">
      <h4>Event Overview</h4>
      <p><strong>Event:</strong> ${enquiry.event_name || `${enquiry.name}'s Event`}</p>
      <p><strong>Venue:</strong> ${enquiry.venue || 'To be finalized'}</p>
      <p><strong>Lead Source:</strong> ${enquiry.source || 'Studio Ingestion'}</p>
    </div>
  </div>

  <div class="section-title">Included Scope & Deliverables</div>
  <table class="services-table">
    <thead>
      <tr>
        <th style="width: 50%;">Deliverable / Service</th>
        <th style="width: 25%;">Format / Specs</th>
        <th style="width: 25%; text-align: right;">Coverage Window</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Traditional & Candid Photography</strong><br><span style="font-size: 11px; color: #64748b;">Full high-resolution edited photo collection on private digital cloud gallery.</span></td>
        <td>High-Res JPEG / RAW</td>
        <td style="text-align: right;">Full Day Coverage</td>
      </tr>
      <tr>
        <td><strong>4K Cinematic Teaser (3-5 Minutes)</strong><br><span style="font-size: 11px; color: #64748b;">Color-graded master highlights reel with licensed soundtrack.</span></td>
        <td>4K UHD MP4 Video</td>
        <td style="text-align: right;">Delivered in 21 Days</td>
      </tr>
      <tr>
        <td><strong>Cinematic Feature Film (20-30 Minutes)</strong><br><span style="font-size: 11px; color: #64748b;">Extended story cut including speeches, vows and key traditions.</span></td>
        <td>4K Master Cut</td>
        <td style="text-align: right;">Delivered in 45 Days</td>
      </tr>
      <tr>
        <td><strong>Aerial Drone Cinematography</strong><br><span style="font-size: 11px; color: #64748b;">Licensed drone pilot capturing stunning venue establishing shots.</span></td>
        <td>4K 60fps Drone Reel</td>
        <td style="text-align: right;">All Scheduled Days</td>
      </tr>
      <tr>
        <td><strong>Premium Canvera Photo Album (40 Pages)</strong><br><span style="font-size: 11px; color: #64748b;">Flush-mount luxury velvet hardcover with archival luster paper.</span></td>
        <td>12×18 Flush Mount</td>
        <td style="text-align: right;">Delivered in 30 Days</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Investment & Payment Schedule</div>
  <div class="pricing-summary">
    <div class="pricing-box">
      <div class="pricing-row">
        <span>Package Subtotal:</span>
        <span>${formatCurrency(budget)}</span>
      </div>
      <div class="pricing-row">
        <span>20% Booking Advance:</span>
        <span>${formatCurrency(advance)}</span>
      </div>
      <div class="pricing-row">
        <span>60% On Event Day:</span>
        <span>${formatCurrency(eventDay)}</span>
      </div>
      <div class="pricing-row">
        <span>20% Balance on Final Delivery:</span>
        <span>${formatCurrency(finalBal)}</span>
      </div>
      <div class="pricing-row total">
        <span>Total Investment:</span>
        <span>${formatCurrency(budget)}</span>
      </div>
    </div>
  </div>

  <div class="terms-box">
    <strong>Terms & Conditions Summary:</strong><br>
    1. Retainer fee of 20% is required to secure your selected dates on the studio production schedule.<br>
    2. RAW footage dumps and edited assets remain archived securely on Pixeva Studio Cloud for 12 months.<br>
    3. Final high-resolution deliveries will be accessible anytime via your personal Client Portal.
  </div>

  <div class="signatures">
    <div class="sig-block">
      <strong>Pixeva Studio Director</strong><br>
      Authorized Signature
    </div>
    <div class="sig-block">
      <strong>${enquiry.name}</strong><br>
      Client Acceptance
    </div>
  </div>

</body>
</html>
  `;
}

export function openProposalPdfWindow(enquiry: Enquiry) {
  const html = generateProposalHtml(enquiry);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function generateReceiptHtml(enquiry: Enquiry, advanceAmount: number, signatureName?: string): string {
  const receiptId = `REC-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const budget = enquiry.estimated_budget || 200000;
  const balanceRemaining = Math.max(0, budget - advanceAmount);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${enquiry.name} - ${receiptId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 40px 20px;
      line-height: 1.5;
      font-size: 13px;
    }

    .receipt-card {
      max-width: 650px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 35px 40px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .receipt-card {
        border: none;
        box-shadow: none;
        padding: 20px 0;
      }
      .no-print {
        display: none !important;
      }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px dashed #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: -0.5px;
    }

    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .status-pill {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }

    .receipt-meta {
      text-align: right;
    }

    .receipt-id {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 13px;
      color: #0f172a;
    }

    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }

    .info-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 15px 18px;
      border-radius: 12px;
    }

    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .info-val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }

    .items-table th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      padding: 10px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }

    .amount-highlight {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 18px 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .amount-label {
      font-size: 12px;
      font-weight: 700;
      color: #166534;
    }

    .amount-val {
      font-size: 26px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      color: #15803d;
    }

    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }

    .btn-print {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div class="receipt-card">
    <div class="header">
      <div>
        <div class="brand-title">Pixeva STUDIO</div>
        <div class="brand-sub">Official Booking Retainer & Payment Receipt</div>
      </div>
      <div class="receipt-meta">
        <div class="status-pill">✓ Payment Verified</div>
        <div class="receipt-id" style="margin-top: 6px;">${receiptId}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${dateStr}</div>
      </div>
    </div>

    <div class="grid-info">
      <div class="info-box">
        <div class="info-label">Billed To</div>
        <div class="info-val">${enquiry.name}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${enquiry.email || 'Client Direct'}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Event & Shoot Date</div>
        <div class="info-val">${enquiry.event_name || "Client Event"}</div>
        <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-top: 2px;">Shoot Date: ${enquiry.received_on || enquiry.event_date || "2026-11-28"}</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Milestone</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Advance Booking Deposit (20%)</strong><br>
            <span style="font-size: 11px; color: #64748b;">Secures shooting schedule, crew lock & equipment staging</span>
          </td>
          <td>20% Retainer</td>
          <td style="text-align: right; font-weight: 700; font-family: 'JetBrains Mono', monospace;">${formatCurrency(advanceAmount)}</td>
        </tr>
        <tr>
          <td>
            <strong>Total Package Value</strong>
          </td>
          <td>100% Contract</td>
          <td style="text-align: right; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: #64748b;">${formatCurrency(budget)}</td>
        </tr>
        <tr>
          <td>
            <strong>Remaining Balance on Shoot/Delivery</strong>
          </td>
          <td>80% Balance</td>
          <td style="text-align: right; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: #64748b;">${formatCurrency(balanceRemaining)}</td>
        </tr>
      </tbody>
    </table>

    <div class="amount-highlight">
      <div>
        <div class="amount-label">Amount Paid Today (Advance Retainer)</div>
        <div style="font-size: 11px; color: #166534; margin-top: 2px;">Payment Method: Verified Instant Deposit</div>
      </div>
      <div class="amount-val">${formatCurrency(advanceAmount)}</div>
    </div>

    <div class="footer">
      <div>
        <strong>Signed & Authorized:</strong> ${signatureName || enquiry.name}<br>
        <span>Pixeva CRM Tri-Cloud Serverless Verification</span>
      </div>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
      </div>
    </div>
  </div>

</body>
</html>
  `;
}

export function openReceiptPdfWindow(enquiry: Enquiry, advanceAmount: number, signatureName?: string) {
  const html = generateReceiptHtml(enquiry, advanceAmount, signatureName);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

