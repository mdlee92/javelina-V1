import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

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

        // Find and delete the patient
        const queryPatientCommand = new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': `PATIENT#${patientId}#`
            }
        });

        const patientResult = await docClient.send(queryPatientCommand);

        if (!patientResult.Items || patientResult.Items.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Patient not found' })
            };
        }

        const patientEntityId = patientResult.Items[0].entityId;

        // Delete patient
        const deletePatientCommand = new DeleteCommand({
            TableName: 'ERNotes',
            Key: {
                userId,
                entityId: patientEntityId
            }
        });

        await docClient.send(deletePatientCommand);

        // Delete associated notes
        const queryNotesCommand = new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': `NOTE#`
            },
            FilterExpression: 'contains(entityId, :patientId)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': `NOTE#`,
                ':patientId': patientId
            }
        });

        const notesResult = await docClient.send(queryNotesCommand);

        if (notesResult.Items && notesResult.Items.length > 0) {
            const deleteRequests = notesResult.Items.map(item => ({
                DeleteRequest: {
                    Key: {
                        userId: item.userId,
                        entityId: item.entityId
                    }
                }
            }));

            for (let i = 0; i < deleteRequests.length; i += 25) {
                const batch = deleteRequests.slice(i, i + 25);
                const batchCommand = new BatchWriteCommand({
                    RequestItems: {
                        ERNotes: batch
                    }
                });
                await docClient.send(batchCommand);
            }
        }

        return {
            statusCode: 204,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: ''
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
