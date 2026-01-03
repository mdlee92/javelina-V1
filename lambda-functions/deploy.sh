#!/bin/bash

# Lambda Deployment Script for ER Notes
# This script deploys all Lambda functions to AWS

set -e

# Configuration
REGION="us-east-2"
ROLE_NAME="ERNotes-Lambda-Role"
RUNTIME="nodejs20.x"
TIMEOUT=10

# Get the IAM role ARN
echo "🔍 Getting IAM role ARN..."
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

if [ -z "$ROLE_ARN" ]; then
    echo "❌ Error: IAM role '$ROLE_NAME' not found"
    exit 1
fi

echo "✅ Found role: $ROLE_ARN"
echo ""

# Function to deploy a Lambda function
deploy_function() {
    local FUNCTION_NAME=$1
    local FILE_NAME=$2

    echo "📦 Deploying $FUNCTION_NAME..."

    # Create zip file
    zip -q $FILE_NAME.zip $FILE_NAME

    # Check if function exists
    if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION >/dev/null 2>&1; then
        echo "  Updating existing function..."
        aws lambda update-function-code \
            --function-name $FUNCTION_NAME \
            --zip-file fileb://$FILE_NAME.zip \
            --region $REGION \
            --output text >/dev/null

        aws lambda update-function-configuration \
            --function-name $FUNCTION_NAME \
            --runtime $RUNTIME \
            --timeout $TIMEOUT \
            --region $REGION \
            --output text >/dev/null
    else
        echo "  Creating new function..."
        aws lambda create-function \
            --function-name $FUNCTION_NAME \
            --runtime $RUNTIME \
            --role $ROLE_ARN \
            --handler index.handler \
            --zip-file fileb://$FILE_NAME.zip \
            --timeout $TIMEOUT \
            --region $REGION \
            --output text >/dev/null
    fi

    # Clean up zip file
    rm $FILE_NAME.zip

    echo "✅ $FUNCTION_NAME deployed successfully"
    echo ""
}

echo "🚀 Starting Lambda deployment..."
echo "================================"
echo ""

# Deploy all functions
deploy_function "ERNotes-createShift" "createShift.mjs"
deploy_function "ERNotes-updateShift" "updateShift.mjs"
deploy_function "ERNotes-deleteShift" "deleteShift.mjs"
deploy_function "ERNotes-createPatient" "createPatient.mjs"
deploy_function "ERNotes-updatePatient" "updatePatient.mjs"
deploy_function "ERNotes-deletePatient" "deletePatient.mjs"
deploy_function "ERNotes-createNote" "createNote.mjs"
deploy_function "ERNotes-updateNote" "updateNote.mjs"
deploy_function "ERNotes-deleteNote" "deleteNote.mjs"

echo "================================"
echo "✅ All Lambda functions deployed successfully!"
echo ""
echo "📝 Summary:"
echo "  Region: $REGION"
echo "  Runtime: $RUNTIME"
echo "  Functions deployed: 9"
echo ""
echo "Next step: Configure API Gateway to connect these functions"
