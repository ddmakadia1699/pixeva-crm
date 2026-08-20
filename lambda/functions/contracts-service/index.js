const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmagwuarvxhhvoacezvl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { enabled: false },
});

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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

  const rawBody = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || event);
  let action = 'GET';
  let payload = rawBody;

  if (httpMethod) {
    if (httpMethod === 'GET') action = 'GET';
    else if (httpMethod === 'POST') action = 'CREATE';
    else if (httpMethod === 'PUT') action = 'SIGN';
  } else {
    action = rawBody.action || event.action || 'GET';
    payload = rawBody.payload || event.payload || rawBody;
  }

  try {
    switch (action) {
      case 'GET': {
        const { data, error } = await supabase
          .from('contracts')
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
        const { data, error } = await supabase.from('contracts').insert([
          {
            title: payload.title || 'Studio Service Agreement',
            client_name: payload.client_name || 'Client',
            client_email: payload.client_email || 'client@example.com',
            terms_summary: payload.terms_summary || 'Standard terms',
            status: payload.status || 'pending_signature',
          },
        ]).select();

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

      case 'SIGN': {
        const { id } = payload;
        const { data, error } = await supabase
          .from('contracts')
          .update({
            status: 'signed',
          })
          .eq('id', id)
          .select();

        if (error) throw error;

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            action: 'SIGN',
            data: data ? data[0] : null,
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
        error: err.message || 'Lambda contracts microservice execution failed',
        executionTimeMs: Date.now() - startTime,
      }),
    };
  }
};
