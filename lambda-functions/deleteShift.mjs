import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, BatchWriteCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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

        if (!shiftId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Shift ID is required' })
            };
        }

        // Delete shift
        const deleteShiftCommand = new DeleteCommand({
            TableName: 'ERNotes',
            Key: {
                userId,
                entityId: `SHIFT#${shiftId}`
            }
        });

        await docClient.send(deleteShiftCommand);

        // Query and delete all associated patients and notes
        const queryCommand = new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'contains(entityId, :shiftId)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':shiftId': shiftId
            }
        });

        const queryResult = await docClient.send(queryCommand);

        // Delete associated items in batches
        if (queryResult.Items && queryResult.Items.length > 0) {
            const deleteRequests = queryResult.Items.map(item => ({
                DeleteRequest: {
                    Key: {
                        userId: item.userId,
                        entityId: item.entityId
                    }
                }
            }));

            // DynamoDB batch write limit is 25 items
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
