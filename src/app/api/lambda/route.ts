import { NextRequest, NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

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

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { functionName, payloadData } = await req.json();

    if (!isAWSConfigured || !lambdaClient) {
      // Simulate AWS Lambda execution latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        success: true,
        functionName: functionName || 'pdf-generator-service',
        statusCode: 200,
        payload: {
          message: `[AWS Lambda Worker] Function '${functionName}' executed successfully!`,
          result: payloadData || {},
          timestamp: new Date().toISOString(),
        },
        executionTimeMs: Date.now() - startTime,
        simulated: true,
      });
    }

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify(payloadData || {})),
    });

    const response = await lambdaClient.send(command);
    const resultString = response.Payload ? Buffer.from(response.Payload).toString('utf-8') : '{}';
    const parsedPayload = JSON.parse(resultString);

    return NextResponse.json({
      success: response.StatusCode === 200,
      functionName,
      statusCode: response.StatusCode || 500,
      payload: parsedPayload,
      executionTimeMs: Date.now() - startTime,
      simulated: false,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        functionName: 'unknown',
        statusCode: 500,
        payload: { error: error.message || 'AWS Lambda invocation failed' },
        executionTimeMs: Date.now() - startTime,
        simulated: false,
      },
      { status: 500 }
    );
  }
}
