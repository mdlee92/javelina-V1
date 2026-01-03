import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    try {
        const userId = event.requestContext?.authorizer?.claims?.sub;

        if (!userId) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        const shiftId = event.pathParameters?.shiftId;
        const body = JSON.parse(event.body);
        const { name } = body;

        if (!shiftId || !name) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Shift ID and patient name are required' })
            };
        }

        const patientId = randomUUID();
        const now = new Date().toISOString();

        const patient = {
            id: patientId,
            name,
            notes: [],
            archived: false,
            createdAt: now
        };

        const command = new PutCommand({
            TableName: 'ERNotes',
            Item: {
                userId,
                entityId: `PATIENT#${patientId}#${shiftId}`,
                entityType: 'PATIENT',
                data: JSON.stringify(patient),
                createdAt: now,
                updatedAt: now
            }
        });

        await docClient.send(command);

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ patient })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
