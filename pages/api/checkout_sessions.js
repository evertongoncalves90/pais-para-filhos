import Stripe from 'stripe';
//import mongoose from 'mongoose';
//import Timeline from '../../models/Timeline'; // Certifique-se de que o caminho está correto

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { timelineId } = req.body;  // Recebe o _id do MongoDB como timelineId

            if (!timelineId) {
                return res.status(400).json({ error: 'timelineId não foi fornecido.' });
            }

            console.log('VERIFICA ID MongoDB ' + timelineId);

            // Criar a sessão de checkout no Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'brl',
                            product_data: {
                                name: 'Surprise For Love: Sua página personalizada para seu amor + QRCode para fazer aquela surpresa!',
                            },
                            unit_amount: 2190, // Exemplo: 21,90 BRL
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                // Use o timelineId do MongoDB
                success_url: `${baseUrl}/success?timelineId=${timelineId}`,
                cancel_url: `${baseUrl}/cancel`,
            });

            console.log('Sessão de pagamento criada com sucesso:', session.id);
            res.status(200).json({ sessionId: session.id });
        } catch (err) {
            console.error('Erro ao criar sessão de pagamento:', err.message);
            res.status(500).json({ error: 'Falha ao criar a sessão de checkout.' });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Método não permitido');
    }
}