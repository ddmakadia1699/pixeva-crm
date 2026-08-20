import { NextRequest, NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
const bookingsHandler = require('../../../../lambda/functions/bookings-service/index.js').handler;

const awsRegion = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';

const isAWSConfigured = Boolean(
  accessKeyId &&
  secretAccessKey &&
  !accessKeyId.includes('EXAMPLE')
);

const lambdaClient = isAWSConfigured
  ? new LambdaClient({
      region: awsRegion,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

async function executeLambdaOrFallback(action: string, payload: any) {
  const functionName = 'bookings-service';

  if (isAWSConfigured && lambdaClient) {
    try {
      const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: Buffer.from(JSON.stringify({ action, payload })),
      });

      const response = await lambdaClient.send(command);
      const resultString = response.Payload ? Buffer.from(response.Payload).toString('utf-8') : '{}';
      const parsed = JSON.parse(resultString);
      if (parsed.statusCode === 200) {
        return typeof parsed.body === 'string' ? JSON.parse(parsed.body) : parsed;
      }
    } catch (awsErr: any) {
      console.log(`[API Gateway] AWS Lambda '${functionName}' execution falling back to serverless handler:`, awsErr.message);
    }
  }

  // Execute serverless microservice handler directly
  const res = await bookingsHandler({ action, payload });
  return typeof res.body === 'string' ? JSON.parse(res.body) : res;
}

export async function GET() {
  const result = await executeLambdaOrFallback('GET', {});
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const result = await executeLambdaOrFallback('CREATE', payload);
  return NextResponse.json(result);
}
