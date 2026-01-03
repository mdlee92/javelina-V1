import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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

        const noteId = event.pathParameters?.noteId;

        if (!noteId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Note ID is required' })
            };
        }

        // Find the note
        const queryCommand = new QueryCommand({
            TableName: 'ERNotes',
            KeyConditionExpression: 'userId = :userId AND begins_with(entityId, :prefix)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':prefix': `NOTE#${noteId}#`
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
                body: JSON.stringify({ error: 'Note not found' })
            };
        }

        const noteEntityId = queryResult.Items[0].entityId;

        // Delete note
        const deleteCommand = new DeleteCommand({
            TableName: 'ERNotes',
            Key: {
                userId,
                entityId: noteEntityId
            }
        });

        await docClient.send(deleteCommand);

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
