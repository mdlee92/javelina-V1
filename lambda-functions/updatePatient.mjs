import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

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

        if (!patientId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Patient ID is required' })
            };
        }

        // Find the patient (need to query because we don't know the shiftId part of entityId)
        const queryCommand = new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': `PATIENT#${patientId}#`
            }
        });

        const queryResult = await docClient.send(queryCommand);

        if (!queryResult.Items || queryResult.Items.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Patient not found' })
            };
        }

        const item = queryResult.Items[0];
        const patientData = JSON.parse(item.data);

        // Update patient data
        if (body.name !== undefined) patientData.name = body.name;
        if (body.archived !== undefined) patientData.archived = body.archived;

        const command = new PutCommand({
            TableName: 'ERNotes',
            Item: {
                userId,
                entityId: item.entityId,
                entityType: 'PATIENT',
                data: JSON.stringify(patientData),
                createdAt: item.createdAt,
                updatedAt: new Date().toISOString()
            }
        });

        await docClient.send(command);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ patient: patientData })
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
