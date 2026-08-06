export interface LambdaInvokeResult {
  success: boolean;
  functionName: string;
  statusCode: number;
  payload: any;
  executionTimeMs: number;
  simulated: boolean;
}

export const isAWSConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_SECRET_ACCESS_KEY && 
  !process.env.AWS_ACCESS_KEY_ID.includes('EXAMPLE')
);

/**
 * Helper utility to invoke an AWS Lambda function from the browser or server
 * via the Next.js /api/lambda backend route.
 */
export async function invokeLambdaFunction(
  functionName: string,
  payloadData: Record<string, any>
): Promise<LambdaInvokeResult> {
  const startTime = Date.now();

  try {
    const res = await fetch('/api/lambda', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ functionName, payloadData }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        functionName,
        statusCode: res.status,
        payload: errJson.payload || { error: 'Server error' },
        executionTimeMs: Date.now() - startTime,
        simulated: true,
      };
    }

    const data: LambdaInvokeResult = await res.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      functionName,
      statusCode: 500,
      payload: { error: error.message || 'Network invocation failed' },
      executionTimeMs: Date.now() - startTime,
      simulated: true,
    };
  }
}
