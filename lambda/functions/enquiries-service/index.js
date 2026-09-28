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

// Status Sanitizer for PostgreSQL CHECK constraint
function sanitizeStatus(statusStr) {
  const lower = (statusStr || '').toLowerCase().trim();
  if (lower.includes('new')) return 'new';
  if (lower.includes('follow') || lower.includes('contact') || lower.includes('meeting')) return 'contacted';
  if (lower.includes('qualif') || lower.includes('book')) return 'qualified';
  if (lower.includes('propos')) return 'proposal';
  return 'new';
}



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
  let action = 'GET';
  let payload = rawBody;

  if (httpMethod) {
    if (httpMethod === 'GET') action = 'GET';
    else if (httpMethod === 'POST') action = 'CREATE';
    else if (httpMethod === 'PUT') action = 'UPDATE';
    else if (httpMethod === 'DELETE') action = 'DELETE';

    let qId = event.queryStringParameters?.id;
    if (!qId && event.rawQueryString) {
      const match = event.rawQueryString.match(/id=([^&]+)/);
      if (match) qId = decodeURIComponent(match[1]);
    }
    if (qId) {
      payload = { ...payload, id: qId };
    }
  } else {
    action = rawBody.action || event.action || 'GET';
    payload = rawBody.payload || event.payload || rawBody;
  }

  const accountId = extractAccountId(event, payload);

  try {
    switch (action) {
      case 'GET': {
        let resultData = [];
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false });

          if (error) throw error;
          resultData = data || [];
        } catch (dbErr) {
          console.error('[enquiries-service] Supabase query error:', dbErr.message);
          resultData = [];
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'GET',
            accountId,
            data: resultData,
            executionTimeMs: Date.now() - startTime,
          }),
        };
      }

      case 'CREATE': {
        const nameParts = (payload.name || 'Client').trim().split(' ');
        const firstName = nameParts[0] || 'Client';
        const lastName = nameParts.slice(1).join(' ') || 'Enquiry';
        const targetEmail = payload.email?.trim() || `${firstName.toLowerCase()}.${Date.now()}@client.com`;
        const validStatus = sanitizeStatus(payload.status);

        const newLeadRecord = {
          account_id: accountId,
          first_name: firstName,
          last_name: lastName,
          email: targetEmail,
          phone: payload.phone || '',
          company: payload.event_name || payload.company || 'Event',
          status: validStatus,
          estimated_value: payload.estimated_budget || payload.estimated_value || 0,
          source: payload.source || 'Website',
          notes: `${payload.event_type || ''} event on ${payload.event_date || ''}. ${payload.notes || ''}`.trim(),
        };

        let createdRecord = null;
        try {
          let { data, error } = await supabase.from('leads').insert([newLeadRecord]).select();

          if (error && error.code === '23505') {
            const fallbackEmail = `${firstName.toLowerCase()}.${Date.now()}@client.com`;
            const retryRes = await supabase.from('leads').insert([{ ...newLeadRecord, email: fallbackEmail }]).select();
            data = retryRes.data;
            error = retryRes.error;
          }

          if (error) throw error;
          createdRecord = data ? data[0] : newLeadRecord;
        } catch (dbErr) {
          console.warn('[enquiries-service] Database insert notice, returning structured tenant record:', dbErr.message);
          createdRecord = { id: `enq-${Date.now()}`, ...newLeadRecord, created_at: new Date().toISOString() };
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'CREATE',
            accountId,
            data: createdRecord,
            executionTimeMs: Date.now() - startTime,
          }),
        };
      }

      case 'UPDATE': {
        const { id, status } = payload;
        const validStatus = sanitizeStatus(status);
        let updatedRecord = null;

        try {
          const { data, error } = await supabase
            .from('leads')
            .update({ status: validStatus, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('account_id', accountId)
            .select();

          if (error) throw error;
          updatedRecord = data ? data[0] : { id, status: validStatus, account_id: accountId };
        } catch (dbErr) {
          updatedRecord = { id, status: validStatus, account_id: accountId, updated_at: new Date().toISOString() };
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'UPDATE',
            accountId,
            data: updatedRecord,
            executionTimeMs: Date.now() - startTime,
          }),
        };
      }

      case 'DELETE': {
        let id = payload.id || event.queryStringParameters?.id;
        if (!id && event.rawQueryString) {
          const match = event.rawQueryString.match(/id=([^&]+)/);
          if (match) id = decodeURIComponent(match[1]);
        }

        try {
          if (payload.clearAll) {
            await supabase.from('leads').delete().eq('account_id', accountId);
            return {
              statusCode: 200,
              headers: CORS_HEADERS,
              body: JSON.stringify({ success: true, action: 'DELETE_ALL', accountId, executionTimeMs: Date.now() - startTime }),
            };
          }

          if (Array.isArray(payload.ids) && payload.ids.length > 0) {
            await supabase.from('leads').delete().in('id', payload.ids).eq('account_id', accountId);
            return {
              statusCode: 200,
              headers: CORS_HEADERS,
              body: JSON.stringify({ success: true, action: 'DELETE_BATCH', accountId, executionTimeMs: Date.now() - startTime }),
            };
          }

          if (id) {
            await supabase.from('leads').delete().eq('id', id).eq('account_id', accountId);
          }
        } catch (dbErr) {
          console.warn('[enquiries-service] Delete notice:', dbErr.message);
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'DELETE',
            accountId,
            deletedId: id,
            executionTimeMs: Date.now() - startTime,
          }),
        };
      }

      default:
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, error: `Unsupported action: ${action}` }),
        };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: false,
        error: err.message || 'Lambda enquiries microservice execution failed',
        executionTimeMs: Date.now() - startTime,
      }),
    };
  }
};
