import Stripe from 'stripe';

const stripe = new Stripe('sk_test_ sk_test_51RGJQrRoS8y6Rhu6jlHlQ4zhEi3cxX3bsguvBEDoxklHF7qo2A3ycFskYui3agAajaVFJfBeOPMdaW0hOkPoQneW0041iPeISD', {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    line_items: [
      {
        price: 'price_1RGJTkRoS8y6Rhu6BStImLD0', // 주인님의 Shinji 상품 ID
        quantity: 1,
      },
    ],
    success_url: 'https://shinji.vercel.app/success',
    cancel_url: 'https://shinji.vercel.app/cancel',
  });

  res.status(200).json({ url: session.url });
}
