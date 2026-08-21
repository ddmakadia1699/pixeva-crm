const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmagwuarvxhhvoacezvl.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build_time_init';
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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

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

  try {
    switch (action) {
      case 'GET': {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'GET',
            data: data || [],
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

        let { data, error } = await supabase.from('leads').insert([
          {
            first_name: firstName,
            last_name: lastName,
            email: targetEmail,
            phone: payload.phone || '',
            company: payload.event_name || 'Event',
            status: validStatus,
            estimated_value: payload.estimated_budget || 0,
            source: payload.source || 'Website',
            notes: `${payload.event_type || ''} event on ${payload.event_date || ''}. ${payload.notes || ''}`.trim(),
          },
        ]).select();

        if (error && error.code === '23505') {
          const fallbackEmail = `${firstName.toLowerCase()}.${Date.now()}@client.com`;
          const retryRes = await supabase.from('leads').insert([
            {
              first_name: firstName,
              last_name: lastName,
              email: fallbackEmail,
              phone: payload.phone || '',
              company: payload.event_name || 'Event',
              status: validStatus,
              estimated_value: payload.estimated_budget || 0,
              source: payload.source || 'Website',
              notes: `${payload.event_type || ''} event on ${payload.event_date || ''}. ${payload.notes || ''}`.trim(),
            },
          ]).select();

          data = retryRes.data;
          error = retryRes.error;
        }

        if (error) throw error;

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'CREATE',
            data: data ? data[0] : null,
            executionTimeMs: Date.now() - startTime,
          }),
        };
      }

      case 'UPDATE': {
        const { id, status } = payload;
        const validStatus = sanitizeStatus(status);

        const { data, error } = await supabase
          .from('leads')
          .update({ status: validStatus, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();

        if (error) throw error;

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'UPDATE',
            data: data ? data[0] : null,
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

        if (payload.clearAll) {
          const { error } = await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, action: 'DELETE_ALL', executionTimeMs: Date.now() - startTime }),
          };
        }

        if (Array.isArray(payload.ids) && payload.ids.length > 0) {
          const { error } = await supabase.from('leads').delete().in('id', payload.ids);
          if (error) throw error;
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, action: 'DELETE_BATCH', executionTimeMs: Date.now() - startTime }),
          };
        }

        if (!id) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, error: 'Missing id parameter for DELETE' }),
          };
        }

        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'DELETE',
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
