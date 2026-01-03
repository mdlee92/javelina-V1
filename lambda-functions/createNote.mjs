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

        const patientId = event.pathParameters?.patientId;
        const body = JSON.parse(event.body);
        const { content } = body;

        if (!patientId || !content) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Patient ID and note content are required' })
            };
        }

        const noteId = randomUUID();
        const now = new Date().toISOString();

        const note = {
            id: noteId,
            content,
            createdAt: now
        };

        const command = new PutCommand({
            TableName: 'ERNotes',
            Item: {
                userId,
                entityId: `NOTE#${noteId}#${patientId}`,
                entityType: 'NOTE',
                data: JSON.stringify(note),
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
            body: JSON.stringify({ note })
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
