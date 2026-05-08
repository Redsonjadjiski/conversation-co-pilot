export async function handler(event: any) {
  try {
    const { endpoint, method = 'GET', body } = JSON.parse(event.body || '{}');
    
    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Endpoint is required' })
      };
    }

    const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
    
    // Updated to c130 as per user request
    const response = await fetch(`https://evolution-api-production-c130.up.railway.app${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY || ''
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
