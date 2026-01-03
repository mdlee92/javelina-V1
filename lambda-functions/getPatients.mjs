import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // Get userId from Cognito authorizer
        const userId = event.requestContext?.authorizer?.claims?.sub;
        const shiftId = event.pathParameters?.shiftId;

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

        if (!shiftId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'shiftId is required' })
            };
        }

        // Query all patients for this shift
        // entityId format: PATIENT#{patientId}#{shiftId}
        const result = await docClient.send(new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': 'PATIENT#'
            }
        }));

        // Filter patients for this specific shift (client-side filter)
        const patients = result.Items
            .filter(item => item.entityId.includes(`#${shiftId}`))
            .map(item => {
                const patient = JSON.parse(item.data);
                // Notes will be fetched separately by useNotes hook
                return {
                    ...patient,
                    notes: [] // Empty array, notes loaded separately
                };
            });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patients })
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
                error: 'Failed to get patients',
                details: error.message
            })
        };
    }
};
