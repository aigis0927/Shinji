import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe('sk_test_여기에_비밀키', {
  apiVersion: '2022-11-15',
});

const supabase = createClient(
  'https://njigqyhekbazqxscrzvf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...주인님의 anon key'
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      'whsec_여기에_웹훅_시크릿키'
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 결제 완료 시
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const email = session.customer_email;

    // Supabase 유저 정보 업데이트
    await supabase
      .from('profiles')
      .update({ subscriptionActive: true })
      .eq('email', email);
  }

  res.status(200).send('Webhook received');
}
