const { createClient } = require('@supabase/supabase-js');

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return Boolean(url && key && !url.includes('your-supabase-project') && !key.startsWith('dummy'));
}

let supabaseClient = null;
function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      realtime: { enabled: false },
    });
  }
  return supabaseClient;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-account-id, X-Account-Id',
};

function extractAccountId(event, payload) {
  const headers = event?.headers || {};
  return (
    headers['x-account-id'] ||
    headers['X-Account-Id'] ||
    headers['x-accountid'] ||
    event?.queryStringParameters?.accountId ||
    event?.queryStringParameters?.account_id ||
    payload?.account_id ||
    payload?.accountId ||
    'user_3I2lBpsfTZcxw4L1GpKAMPCc45a'
  );
}

const SEED_GALLERIES = [
  {
    id: 'g-1',
    account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
    title: 'Sarah & Mark Grand Wedding',
    event_date: '2026-08-05',
    photo_count: 1420,
    guest_selfie_count: 384,
    qr_code_url: 'https://pixeva.co/g/sarah-mark-wedding',
    qr_code_text: 'https://pixeva.co/g/sarah-mark-wedding',
    cover_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
    cover_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'g-2',
    account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
    title: 'Nexus Tech Global AI Summit 2026',
    event_date: '2026-07-28',
    photo_count: 2850,
    guest_selfie_count: 920,
    qr_code_url: 'https://pixeva.co/g/nexus-ai-summit',
    qr_code_text: 'https://pixeva.co/g/nexus-ai-summit',
    cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
    cover_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'g-3',
    account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
    title: 'Cyberdyne Gala & Awards Night',
    event_date: '2026-07-15',
    photo_count: 980,
    guest_selfie_count: 240,
    qr_code_url: 'https://pixeva.co/g/cyberdyne-gala',
    qr_code_text: 'https://pixeva.co/g/cyberdyne-gala',
    cover_image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60',
    cover_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60',
  },
];

const SEED_REQUESTS = [
  {
    id: 'req-1',
    account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
    project: 'Julian & Sophia Luxury Destination Wedding',
    project_name: 'Julian & Sophia Luxury Destination Wedding',
    category: 'Photos',
    details: 'Skin retouching & tone correction on 15 main stage wedding photos',
    assign_team: null,
    status: 'Pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'req-2',
    account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
    project: 'Julian & Sophia Luxury Destination Wedding',
    project_name: 'Julian & Sophia Luxury Destination Wedding',
    category: 'Photos',
    details: 'Black & White color grade for reception portrait album selections',
    assign_team: null,
    status: 'Pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'req-3',
    account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
    project: 'Julian & Sophia Luxury Destination Wedding',
    project_name: 'Julian & Sophia Luxury Destination Wedding',
    category: 'Video',
    details: 'Include additional vows speech audio clip in 4-minute highlight reel',
    assign_team: null,
    status: 'Pending',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const SEED_FINANCES = {
  account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
  totalRevenue: 615000,
  receivedRevenue: 380000,
  pendingRevenue: 235000,
  projectFinances: [
    {
      id: 'fin-proj-1',
      account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
      project_name: 'Julian & Sophia Destination Wedding',
      client: 'Julian & Sophia',
      event_date: '04 Dec 2026',
      received: 140000,
      balance_due: 140000,
      team_payouts: 45000,
      expenses: 12000,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fin-proj-2',
      account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
      project_name: 'Vance Corporate Annual Gala',
      client: 'Eleanor Vance',
      event_date: '15 Nov 2026',
      received: 150000,
      balance_due: 0,
      team_payouts: 30000,
      expenses: 8000,
      created_at: new Date().toISOString(),
    },
    {
      id: 'fin-proj-3',
      account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
      project_name: 'BioTech Global Summit 2026',
      client: 'Dr. Alistair Thorne',
      event_date: '20 Oct 2026',
      received: 90000,
      balance_due: 95000,
      team_payouts: 25000,
      expenses: 5000,
      created_at: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      id: 'tx-1',
      account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
      project_name: 'Julian & Sophia Destination Wedding',
      type: 'Payment Received',
      category: 'Client Advance',
      amount: 140000,
      date: '2026-09-01',
      payment_mode: 'Bank Transfer (NEFT)',
      note: 'Initial 50% deposit received',
    },
    {
      id: 'tx-2',
      account_id: 'user_3I2lBpsfTZcxw4L1GpKAMPCc45a',
      project_name: 'Vance Corporate Annual Gala',
      type: 'Payment Received',
      category: 'Full Settlement',
      amount: 150000,
      date: '2026-08-20',
      payment_mode: 'Corporate Wire',
      note: '100% upfront settlement',
    },
  ],
};

exports.handler = async (event) => {
  const startTime = Date.now();
  const httpMethod = event.requestContext?.http?.method || event.httpMethod;

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const supabase = getSupabase();
  const rawBody = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || event);
  const accountId = extractAccountId(event, rawBody);

  // Identify resource type: e.g. /galleries, /client-requests, /finances
  const rawPath = event.rawPath || event.path || '';
  let resource = 'galleries';
  if (rawPath.includes('client-request') || rawBody.resource === 'client-requests') {
    resource = 'client-requests';
  } else if (rawPath.includes('finance') || rawBody.resource === 'finances') {
    resource = 'finances';
  } else if (rawPath.includes('dashboard') || rawBody.resource === 'dashboard') {
    resource = 'dashboard';
  }

  const action = httpMethod === 'POST' ? 'CREATE' : httpMethod === 'PUT' ? 'UPDATE' : httpMethod === 'DELETE' ? 'DELETE' : (rawBody.action || 'GET');

  try {
    // 1. GALLERIES RESOURCE
    if (resource === 'galleries') {
      if (action === 'GET') {
        let items = [];
        try {
          const { data, error } = await supabase
            .from('galleries')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          items = data || [];
        } catch (e) {
          items = SEED_GALLERIES.filter((g) => g.account_id === accountId);
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, accountId, data: items, executionTimeMs: Date.now() - startTime }),
        };
      }
      if (action === 'CREATE') {
        const item = {
          account_id: accountId,
          title: rawBody.title || 'New Gallery',
          event_date: rawBody.event_date || new Date().toISOString().split('T')[0],
          photo_count: rawBody.photo_count || 0,
          guest_selfie_count: 0,
          qr_code_url: rawBody.qr_code_url || `https://pixeva.co/g/${Date.now()}`,
          cover_image_url: rawBody.cover_image || rawBody.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=60',
        };
        let created = null;
        try {
          const { data, error } = await supabase.from('galleries').insert([item]).select();
          if (error) throw error;
          created = data ? data[0] : item;
        } catch (e) {
          created = { id: `g-${Date.now()}`, ...item, created_at: new Date().toISOString() };
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, accountId, data: created, executionTimeMs: Date.now() - startTime }),
        };
      }
    }

    // 2. CLIENT REQUESTS RESOURCE
    if (resource === 'client-requests') {
      if (action === 'GET') {
        let items = [];
        try {
          const { data, error } = await supabase
            .from('client_requests')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          items = data || [];
        } catch (e) {
          items = SEED_REQUESTS.filter((r) => r.account_id === accountId);
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, accountId, data: items, executionTimeMs: Date.now() - startTime }),
        };
      }
      if (action === 'CREATE') {
        const item = {
          account_id: accountId,
          project_name: rawBody.project_name || rawBody.project || 'Project',
          category: rawBody.category || 'General',
          details: rawBody.details || '',
          assign_team: rawBody.assign_team || null,
          status: rawBody.status || 'Pending',
        };
        let created = null;
        try {
          const { data, error } = await supabase.from('client_requests').insert([item]).select();
          if (error) throw error;
          created = data ? data[0] : item;
        } catch (e) {
          created = { id: `req-${Date.now()}`, ...item, created_at: new Date().toISOString() };
        }
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, accountId, data: created, executionTimeMs: Date.now() - startTime }),
        };
      }
      if (action === 'UPDATE') {
        const { id, ...updates } = rawBody;
        try {
          await supabase.from('client_requests').update(updates).eq('id', id).eq('account_id', accountId);
        } catch (e) {}
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, accountId, data: { id, ...updates }, executionTimeMs: Date.now() - startTime }),
        };
      }
    }

    // 3. FINANCES RESOURCE
    if (resource === 'finances') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          accountId,
          data: SEED_FINANCES,
          executionTimeMs: Date.now() - startTime,
        }),
      };
    }

    // 4. DASHBOARD AGGREGATION METRICS
    if (resource === 'dashboard') {
      let enquiriesCount = { new: 3, followUp: 4, booked: 2, total: 9 };
      let activeProjects = 3;

      try {
        const { data: leads } = await supabase.from('leads').select('status').eq('account_id', accountId);
        if (Array.isArray(leads) && leads.length > 0) {
          enquiriesCount = {
            new: leads.filter((l) => l.status === 'new' || !l.status).length,
            followUp: leads.filter((l) => l.status === 'contacted' || l.status === 'qualified' || l.status === 'proposal').length,
            booked: leads.filter((l) => l.status === 'booked').length,
            total: leads.length,
          };
        }
      } catch (e) {}

      try {
        const { data: projs } = await supabase.from('bookings').select('id').eq('account_id', accountId);
        if (Array.isArray(projs) && projs.length > 0) {
          activeProjects = projs.length;
        }
      } catch (e) {}

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          accountId,
          data: {
            enquiriesNew: enquiriesCount.new,
            enquiriesFollowUp: enquiriesCount.followUp,
            enquiriesBooked: enquiriesCount.booked,
            totalEnquiries: enquiriesCount.total,
            activeProjectsCount: activeProjects,
            totalRevenue: '₹9,80,000',
            receivedRevenue: '₹5,60,000',
            pendingRevenue: '₹4,20,000',
            postProdInProgress: 2,
            postProdReview: 1,
            postProdReady: 4,
            clientRequestsPending: 2,
          },
          executionTimeMs: Date.now() - startTime,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: true, accountId, message: 'Studio data service online' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
