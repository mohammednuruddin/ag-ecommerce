const { v4: uuidv4 } = require('uuid');

// Your subscription key
const SUBSCRIPTION_KEY = 'bb5e247b9bc44006bfa82c4aa5d90997';
const BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

// Generate a UUID for the API user
const referenceId = uuidv4();
console.log('Generated Reference ID (X-Reference-Id):', referenceId);

async function createMoMoApiUser() {
  try {
    console.log('\n=== Step 1: Creating MoMo API User ===');
    
    // Step 1: Create API User
    const createUserResponse = await fetch(`${BASE_URL}/v1_0/apiuser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reference-Id': referenceId,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      },
      body: JSON.stringify({
        providerCallbackHost: 'https://webhook.site/unique-id-here'
      })
    });

    if (createUserResponse.status === 201) {
      console.log('✅ API User created successfully!');
    } else {
      console.log('❌ Failed to create API user:', createUserResponse.status);
      const errorText = await createUserResponse.text();
      console.log('Error details:', errorText);
      return;
    }

    console.log('\n=== Step 2: Getting User Information ===');
    
    // Step 2: Get User Information
    const getUserResponse = await fetch(`${BASE_URL}/v1_0/apiuser/${referenceId}`, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    });

    if (getUserResponse.ok) {
      const userInfo = await getUserResponse.json();
      console.log('✅ User information retrieved:');
      console.log('Target Environment:', userInfo.targetEnvironment);
      console.log('Provider Callback Host:', userInfo.providerCallbackHost);
    } else {
      console.log('❌ Failed to get user information:', getUserResponse.status);
      return;
    }

    console.log('\n=== Step 3: Creating API Key ===');
    
    // Step 3: Create API Key
    const createApiKeyResponse = await fetch(`${BASE_URL}/v1_0/apiuser/${referenceId}/apikey`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
      }
    });

    if (createApiKeyResponse.ok) {
      const apiKeyData = await createApiKeyResponse.json();
      console.log('✅ API Key created successfully!');
      console.log('API Key:', apiKeyData.apiKey);
      
      console.log('\n=== Environment Variables to Update ===');
      console.log('Add these to your .env.local file:');
      console.log(`MOMO_API_USER_ID=${referenceId}`);
      console.log(`MOMO_API_KEY=${apiKeyData.apiKey}`);
      
      return {
        userId: referenceId,
        apiKey: apiKeyData.apiKey
      };
    } else {
      console.log('❌ Failed to create API key:', createApiKeyResponse.status);
      const errorText = await createApiKeyResponse.text();
      console.log('Error details:', errorText);
    }

  } catch (error) {
    console.error('❌ Error during API setup:', error.message);
  }
}

// Test function to verify the setup
async function testApiAccess(userId, apiKey) {
  try {
    console.log('\n=== Step 4: Testing API Access ===');
    
    // Get access token
    const tokenResponse = await fetch(`${BASE_URL}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`,
        'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      console.log('✅ Access token retrieved successfully!');
      console.log('Token Type:', tokenData.token_type);
      console.log('Expires In:', tokenData.expires_in, 'seconds');
      console.log('\n🎉 MoMo API setup completed successfully!');
      console.log('\nYour API is ready to use for payments!');
    } else {
      console.log('❌ Failed to get access token:', tokenResponse.status);
      const errorText = await tokenResponse.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error testing API access:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Setting up MoMo API credentials...');
  console.log('Subscription Key:', SUBSCRIPTION_KEY);
  
  const credentials = await createMoMoApiUser();
  
  if (credentials) {
    await testApiAccess(credentials.userId, credentials.apiKey);
  }
}

// Run the setup
main().catch(console.error);