// Test checkout API
async function testCheckout() {
  try {
    console.log('Testing checkout API...');

    // First get the auth token from the browser
    // You'll need to copy the token from your browser's cookies/localStorage
    const response = await fetch('http://localhost:3002/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'starter',
        billingPeriod: 'monthly'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const text = await response.text();
    console.log('Raw response:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed data:', data);

      if (data.url) {
        console.log('✅ Checkout URL received:', data.url);
      } else if (data.sessionId) {
        console.log('⚠️ Session ID received but no URL:', data.sessionId);
      } else {
        console.log('❌ No URL or session ID in response');
      }
    } catch (e) {
      console.log('Failed to parse as JSON:', e);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Note: This will likely fail with 401 because we're not authenticated
// The real test is to check what the API returns when called from the browser
testCheckout();