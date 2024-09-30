import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { timelineId, paymentMethod } = req.body;

            if (!timelineId) {
                return res.status(400).json({ error: 'timelineId não foi fornecido.' });
            }

            if (paymentMethod === 'credit') {
                // Fluxo de pagamento via cartão de crédito com Stripe
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'brl',
                                product_data: {
                                    name: 'Surprise For Love: Sua página personalizada para seu amor + QRCode para fazer aquela surpresa!',
                                },
                                unit_amount: 50, // Exemplo: 2190 = 21,90 BRL
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${baseUrl}/success?timelineId=${timelineId}`,
                    cancel_url: `${baseUrl}/cancel`,
                });

                res.status(200).json({ sessionId: session.id });

            } else if (paymentMethod === 'pix') {
                // Fluxo de pagamento via PIX
                const pixPaymentInstructions = {
                    qrCodeUrl: `${baseUrl}/qrCode.png`,
                    pixCode: '00020101021226850014br.gov.bcb.pix01140429116748005204000053039865404021.905802BR5913Nome do Favorecido6015Nome da Cidade62160512***703A4C8',
                    instructions: 'Por favor, realize o pagamento via PIX escaneando o QR Code ou usando o código PIX acima. Após o pagamento, envie o comprovante para o WhatsApp.',
                };

                res.status(200).json(pixPaymentInstructions);
            } else {
                res.status(400).json({ error: 'Método de pagamento inválido.' });
            }
        } catch (err) {
            console.error('Erro ao criar sessão de pagamento:', err.message);
            res.status(500).json({ error: 'Falha ao criar a sessão de checkout.' });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Método não permitido');
    }
}
