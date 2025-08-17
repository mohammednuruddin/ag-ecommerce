#!/usr/bin/env python3
import requests
import uuid
import json
import base64

# Your subscription key
SUBSCRIPTION_KEY = 'bb5e247b9bc44006bfa82c4aa5d90997'
BASE_URL = 'https://sandbox.momodeveloper.mtn.com'

# Generate a UUID for the API user
reference_id = str(uuid.uuid4())
print(f'Generated Reference ID (X-Reference-Id): {reference_id}')

def create_momo_api_user():
    try:
        print('\n=== Step 1: Creating MoMo API User ===')
        
        # Step 1: Create API User
        headers = {
            'Content-Type': 'application/json',
            'X-Reference-Id': reference_id,
            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
        }
        
        data = {
            'providerCallbackHost': 'https://webhook.site/unique-id-here'
        }
        
        response = requests.post(
            f'{BASE_URL}/v1_0/apiuser',
            headers=headers,
            json=data
        )
        
        if response.status_code == 201:
            print('✅ API User created successfully!')
        else:
            print(f'❌ Failed to create API user: {response.status_code}')
            print(f'Error details: {response.text}')
            return None

        print('\n=== Step 2: Getting User Information ===')
        
        # Step 2: Get User Information
        headers = {
            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
        }
        
        response = requests.get(
            f'{BASE_URL}/v1_0/apiuser/{reference_id}',
            headers=headers
        )
        
        if response.status_code == 200:
            user_info = response.json()
            print('✅ User information retrieved:')
            print(f'Target Environment: {user_info.get("targetEnvironment")}')
            print(f'Provider Callback Host: {user_info.get("providerCallbackHost")}')
        else:
            print(f'❌ Failed to get user information: {response.status_code}')
            return None

        print('\n=== Step 3: Creating API Key ===')
        
        # Step 3: Create API Key
        headers = {
            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
        }
        
        response = requests.post(
            f'{BASE_URL}/v1_0/apiuser/{reference_id}/apikey',
            headers=headers
        )
        
        if response.status_code == 201:
            api_key_data = response.json()
            api_key = api_key_data.get('apiKey')
            print('✅ API Key created successfully!')
            print(f'API Key: {api_key}')
            
            print('\n=== Environment Variables to Update ===')
            print('Add these to your .env.local file:')
            print(f'MOMO_API_USER_ID={reference_id}')
            print(f'MOMO_API_KEY={api_key}')
            
            return {
                'userId': reference_id,
                'apiKey': api_key
            }
        else:
            print(f'❌ Failed to create API key: {response.status_code}')
            print(f'Error details: {response.text}')
            return None

    except Exception as error:
        print(f'❌ Error during API setup: {str(error)}')
        return None

def test_api_access(user_id, api_key):
    try:
        print('\n=== Step 4: Testing API Access ===')
        
        # Create basic auth header
        credentials = f'{user_id}:{api_key}'
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f'{BASE_URL}/collection/token/',
            headers=headers
        )
        
        if response.status_code == 200:
            token_data = response.json()
            print('✅ Access token retrieved successfully!')
            print(f'Token Type: {token_data.get("token_type")}')
            print(f'Expires In: {token_data.get("expires_in")} seconds')
            print('\n🎉 MoMo API setup completed successfully!')
            print('\nYour API is ready to use for payments!')
        else:
            print(f'❌ Failed to get access token: {response.status_code}')
            print(f'Error details: {response.text}')
            
    except Exception as error:
        print(f'❌ Error testing API access: {str(error)}')

def main():
    print('🚀 Setting up MoMo API credentials...')
    print(f'Subscription Key: {SUBSCRIPTION_KEY}')
    
    credentials = create_momo_api_user()
    
    if credentials:
        test_api_access(credentials['userId'], credentials['apiKey'])
        
        # Write credentials to a file for easy copying
        with open('momo-credentials.txt', 'w') as f:
            f.write(f'MOMO_API_USER_ID={credentials["userId"]}\n')
            f.write(f'MOMO_API_KEY={credentials["apiKey"]}\n')
        
        print(f'\n📝 Credentials saved to momo-credentials.txt')

if __name__ == '__main__':
    main()