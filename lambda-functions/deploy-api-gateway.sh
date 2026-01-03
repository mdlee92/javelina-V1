#!/bin/bash

# API Gateway Deployment Script for ER Notes
# This script creates a complete REST API with Cognito authorization

set -e

# Configuration
REGION="us-east-2"
API_NAME="ERNotes-API"
STAGE_NAME="prod"
USER_POOL_ID="us-east-2_lJBTOBXoM"

echo "🚀 Starting API Gateway deployment..."
echo "====================================="
echo ""

# Get Cognito User Pool ARN
echo "🔍 Getting Cognito User Pool ARN..."
USER_POOL_ARN=$(aws cognito-idp describe-user-pool \
    --user-pool-id $USER_POOL_ID \
    --region $REGION \
    --query 'UserPool.Arn' \
    --output text)

echo "✅ User Pool ARN: $USER_POOL_ARN"
echo ""

# Create REST API
echo "📡 Creating REST API..."
API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "REST API for ER Notes application" \
    --region $REGION \
    --endpoint-configuration types=REGIONAL \
    --query 'id' \
    --output text)

echo "✅ API created with ID: $API_ID"
echo ""

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[0].id' \
    --output text)

echo "📋 Root resource ID: $ROOT_ID"
echo ""

# Create Cognito authorizer
echo "🔐 Creating Cognito authorizer..."
AUTHORIZER_ID=$(aws apigateway create-authorizer \
    --rest-api-id $API_ID \
    --name ERNotes-Cognito-Authorizer \
    --type COGNITO_USER_POOLS \
    --provider-arns $USER_POOL_ARN \
    --identity-source 'method.request.header.Authorization' \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ Authorizer created with ID: $AUTHORIZER_ID"
echo ""

# Function to create a resource
create_resource() {
    local PARENT_ID=$1
    local PATH_PART=$2

    aws apigateway create-resource \
        --rest-api-id $API_ID \
        --parent-id $PARENT_ID \
        --path-part $PATH_PART \
        --region $REGION \
        --query 'id' \
        --output text
}

# Function to create a method with Lambda integration
create_method() {
    local RESOURCE_ID=$1
    local HTTP_METHOD=$2
    local LAMBDA_NAME=$3
    local REQUIRE_AUTH=${4:-true}

    # Create method
    aws apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method $HTTP_METHOD \
        --authorization-type ${REQUIRE_AUTH:+COGNITO_USER_POOLS} \
        ${REQUIRE_AUTH:+--authorizer-id $AUTHORIZER_ID} \
        --region $REGION \
        --output text >/dev/null

    # Get Lambda ARN
    LAMBDA_ARN=$(aws lambda get-function \
        --function-name $LAMBDA_NAME \
        --region $REGION \
        --query 'Configuration.FunctionArn' \
        --output text)

    # Create integration
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method $HTTP_METHOD \
        --type AWS_PROXY \
        --integration-http-method POST \
        --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
        --region $REGION \
        --output text >/dev/null

    # Add Lambda permission
    aws lambda add-permission \
        --function-name $LAMBDA_NAME \
        --statement-id "apigateway-${RESOURCE_ID}-${HTTP_METHOD}" \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:$REGION:$(aws sts get-caller-identity --query Account --output text):$API_ID/*/*" \
        --region $REGION \
        --output text >/dev/null 2>&1 || true
}

# Function to enable CORS
enable_cors() {
    local RESOURCE_ID=$1

    # Create OPTIONS method
    aws apigateway put-method \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --authorization-type NONE \
        --region $REGION \
        --output text >/dev/null

    # Create mock integration
    aws apigateway put-integration \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --type MOCK \
        --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
        --region $REGION \
        --output text >/dev/null

    # Create method response
    aws apigateway put-method-response \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --status-code 200 \
        --response-parameters \
            'method.response.header.Access-Control-Allow-Headers=false' \
            'method.response.header.Access-Control-Allow-Methods=false' \
            'method.response.header.Access-Control-Allow-Origin=false' \
        --region $REGION \
        --output text >/dev/null

    # Create integration response
    aws apigateway put-integration-response \
        --rest-api-id $API_ID \
        --resource-id $RESOURCE_ID \
        --http-method OPTIONS \
        --status-code 200 \
        --response-parameters \
            'method.response.header.Access-Control-Allow-Headers='"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'' \
            'method.response.header.Access-Control-Allow-Methods='"'"'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'"'"'' \
            'method.response.header.Access-Control-Allow-Origin='"'"'*'"'"'' \
        --region $REGION \
        --output text >/dev/null
}

echo "🔨 Creating API resources and methods..."
echo ""

# Create /shifts resource
echo "  Creating /shifts..."
SHIFTS_ID=$(create_resource $ROOT_ID "shifts")
create_method $SHIFTS_ID "GET" "ERNotes-getShifts"
create_method $SHIFTS_ID "POST" "ERNotes-createShift"
enable_cors $SHIFTS_ID

# Create /shifts/{shiftId} resource
echo "  Creating /shifts/{shiftId}..."
SHIFT_ID_ID=$(create_resource $SHIFTS_ID "shiftId")
create_method $SHIFT_ID_ID "PUT" "ERNotes-updateShift"
create_method $SHIFT_ID_ID "DELETE" "ERNotes-deleteShift"
enable_cors $SHIFT_ID_ID

# Create /shifts/{shiftId}/patients resource
echo "  Creating /shifts/{shiftId}/patients..."
SHIFT_PATIENTS_ID=$(create_resource $SHIFT_ID_ID "patients")
create_method $SHIFT_PATIENTS_ID "POST" "ERNotes-createPatient"
enable_cors $SHIFT_PATIENTS_ID

# Create /patients resource
echo "  Creating /patients..."
PATIENTS_ID=$(create_resource $ROOT_ID "patients")

# Create /patients/{patientId} resource
echo "  Creating /patients/{patientId}..."
PATIENT_ID_ID=$(create_resource $PATIENTS_ID "patientId")
create_method $PATIENT_ID_ID "PUT" "ERNotes-updatePatient"
create_method $PATIENT_ID_ID "DELETE" "ERNotes-deletePatient"
enable_cors $PATIENT_ID_ID

# Create /patients/{patientId}/notes resource
echo "  Creating /patients/{patientId}/notes..."
PATIENT_NOTES_ID=$(create_resource $PATIENT_ID_ID "notes")
create_method $PATIENT_NOTES_ID "POST" "ERNotes-createNote"
enable_cors $PATIENT_NOTES_ID

# Create /notes resource
echo "  Creating /notes..."
NOTES_ID=$(create_resource $ROOT_ID "notes")

# Create /notes/{noteId} resource
echo "  Creating /notes/{noteId}..."
NOTE_ID_ID=$(create_resource $NOTES_ID "noteId")
create_method $NOTE_ID_ID "PUT" "ERNotes-updateNote"
create_method $NOTE_ID_ID "DELETE" "ERNotes-deleteNote"
enable_cors $NOTE_ID_ID

echo ""
echo "✅ All resources and methods created"
echo ""

# Deploy API
echo "🚀 Deploying API to $STAGE_NAME stage..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name $STAGE_NAME \
    --description "Production deployment" \
    --region $REGION \
    --output text >/dev/null

echo "✅ API deployed successfully"
echo ""

# Get invoke URL
INVOKE_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}"

echo "====================================="
echo "✅ API Gateway setup complete!"
echo ""
echo "📝 API Details:"
echo "  API ID: $API_ID"
echo "  Region: $REGION"
echo "  Stage: $STAGE_NAME"
echo ""
echo "🌐 API Endpoint URL:"
echo "  $INVOKE_URL"
echo ""
echo "📋 Next steps:"
echo "  1. Copy the API endpoint URL above"
echo "  2. Update .env.local with: VITE_API_ENDPOINT=$INVOKE_URL"
echo "  3. Test the application!"
echo ""
