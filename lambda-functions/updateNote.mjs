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

        const noteId = event.pathParameters?.noteId;
        const body = JSON.parse(event.body);
        const { content } = body;

        if (!noteId || !content) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Note ID and content are required' })
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

        const item = queryResult.Items[0];
        const noteData = JSON.parse(item.data);

        // Update note
        noteData.content = content;
        noteData.editedAt = new Date().toISOString();

        const command = new PutCommand({
            TableName: 'ERNotes',
            Item: {
                userId,
                entityId: item.entityId,
                entityType: 'NOTE',
                data: JSON.stringify(noteData),
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
            body: JSON.stringify({ note: noteData })
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
