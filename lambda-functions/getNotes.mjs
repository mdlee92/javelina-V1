import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // Get userId from Cognito authorizer
        const userId = event.requestContext?.authorizer?.claims?.sub;
        const patientId = event.pathParameters?.patientId;

        if (!userId) {
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        if (!patientId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'patientId is required' })
            };
        }

        // Query all notes for this patient
        // entityId format: NOTE#{noteId}#{patientId}
        const result = await docClient.send(new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': 'NOTE#'
            }
        }));

        // Filter notes for this specific patient (client-side filter)
        const notes = result.Items
            .filter(item => item.entityId.includes(`#${patientId}`))
            .map(item => JSON.parse(item.data));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to get notes',
                details: error.message
            })
        };
    }
};
