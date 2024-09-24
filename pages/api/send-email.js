import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, timelineUrl } = req.body;

        if (!email || !timelineUrl) {
            return res.status(400).json({ message: 'Email ou URL da timeline ausentes.' });
        }

        try {
            // Definir o remetente com o objeto Sender, que inclui nome e email
            const sender = new Sender('noreply@surpriseforlove.com', 'Surprise For Love');

            // Configurar parâmetros do e-mail manualmente
            const emailParams = new EmailParams({
                from: sender, // Remetente
                to: [new Recipient(email)], // Destinatário
                subject: 'Sua Timeline está pronta!',
                html: `<p>Olá! Sua timeline está pronta. Aqui está o link para acessá-la: <a href="${timelineUrl}">${timelineUrl}</a></p>`,
                text: `Olá! Sua timeline está pronta. Aqui está o link para acessá-la: ${timelineUrl}`,
            });

            // Enviar o e-mail
            await mailerSend.email.send(emailParams);

            return res.status(200).json({ message: 'E-mail enviado com sucesso.' });
        } catch (error) {
            console.error('Erro ao enviar o e-mail:', error);
            return res.status(500).json({ message: 'Erro ao enviar o e-mail.', error });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Método não permitido');
    }
}
