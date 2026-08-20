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
  } else {
    action = rawBody.action || event.action || 'GET';
    payload = rawBody.payload || event.payload || rawBody;
  }

  try {
    switch (action) {
      case 'GET': {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('date', { ascending: true });

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
        const { data, error } = await supabase.from('bookings').insert([
          {
            title: payload.title || 'Studio Shoot Booking',
            event_type: payload.event_type || 'wedding',
            date: payload.date || new Date().toISOString(),
            location: payload.location || 'Studio HQ',
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
        error: err.message || 'Lambda bookings microservice execution failed',
        executionTimeMs: Date.now() - startTime,
      }),
    };
  }
};
