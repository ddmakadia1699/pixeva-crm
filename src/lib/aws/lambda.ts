import { apiClient } from '@/lib/api/apiClient';

export interface LambdaInvokeResult {
  success: boolean;
  functionName: string;
  statusCode: number;
  payload: any;
  executionTimeMs: number;
  simulated: boolean;
}

/**
 * Background workers the browser may trigger. This is an explicit allow-list: a worker is
 * reachable only if it is listed here AND exists as an authenticated, rate-limited route on
 * the API. The browser never names an AWS function and never holds AWS credentials.
 */
const WORKER_ROUTES: Record<string, string> = {
  'pdf-generator-service': '/pdf-generator',
  'batch-email-service': '/batch-email',
};

/** True when the app knows where the AWS API Gateway is (the public URL, not a secret). */
export const isAWSConfigured = Boolean(process.env.NEXT_PUBLIC_AWS_API_GATEWAY_URL);

/**
 * Run a background worker through the authenticated API Gateway using the user's login token.
 * Replaces the old open /api/lambda proxy that let any caller invoke arbitrary Lambda functions.
 */
export async function invokeLambdaFunction(
  functionName: string,
  payloadData: Record<string, any>
): Promise<LambdaInvokeResult> {
  const startTime = Date.now();
  const route = WORKER_ROUTES[functionName];

  if (!route) {
    return {
      success: false,
      functionName,
      statusCode: 404,
      payload: { error: `Worker '${functionName}' is not available.` },
      executionTimeMs: 0,
      simulated: false,
    };
  }

  const res = await apiClient.workers.run(route, payloadData || {});
  return {
    success: res.success,
    functionName,
    statusCode: res.status || 500,
    payload: res.success ? res.data : { error: res.error || 'Worker request failed' },
    executionTimeMs: Date.now() - startTime,
    simulated: false,
  };
}
