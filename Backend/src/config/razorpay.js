import Razorpay from 'razorpay';

let razorpayInstance = null;

export const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.log('⚠️ Razorpay not configured - using mock payments');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id,
    key_secret
  });

  return razorpayInstance;
};

export default getRazorpay;
