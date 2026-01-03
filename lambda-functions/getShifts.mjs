import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // Get userId from Cognito authorizer
        const userId = event.requestContext?.authorizer?.claims?.sub;

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

        // Query all shifts for this user
        const result = await docClient.send(new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': 'SHIFT#'
            }
        }));

        // Parse the shift data and get patients for each shift
        const shifts = await Promise.all(result.Items.map(async (item) => {
            const shift = JSON.parse(item.data);

            // Get all patients for this shift
            // entityId format: PATIENT#{patientId}#{shiftId}
            const patientsResult = await docClient.send(new QueryCommand({
                TableName: 'ERNotes',
                KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
                ExpressionAttributeValues: {
                    ':userId': userId,
                    ':prefix': `PATIENT#`
                }
            }));

            // Filter patients for this specific shift (client-side filter)
            const patients = patientsResult.Items
                .filter(pItem => pItem.entityId.includes(`#${shift.id}`))
                .map(pItem => JSON.parse(pItem.data));

            return {
                ...shift,
                patients: patients
            };
        }));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shifts })
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
                error: 'Failed to get shifts',
                details: error.message
            })
        };
    }
};
