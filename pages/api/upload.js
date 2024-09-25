import mongoose from 'mongoose';
import QRCode from 'qrcode';

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Definir o modelo da Timeline no MongoDB (apenas se não existir)
const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', new mongoose.Schema({
    nomeCasal: String,
    dataRelacao: String,
    nomeAmigo: String,
    dataAmizade: String,
    mensagem: String,
    imageUrls: [String],
    youtubeUrl: String,
    tipoRelacao: String,
}));

// Habilitar o bodyParser padrão do Next.js para receber JSON
export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {
                nomeCasal,
                dataRelacao,
                nomeAmigo,
                dataAmizade,
                mensagem,
                youtubeUrl,
                tipoRelacao,
                imageUrls, // Recebe as URLs das imagens enviadas pelo cliente
            } = req.body;

            // Verificar se imageUrls é um array
            if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
                return res.status(400).json({ error: 'Nenhuma imagem foi fornecida.' });
            }

            // Armazenar a timeline no banco de dados
            const newTimeline = new Timeline({
                nomeCasal,
                dataRelacao,
                nomeAmigo,
                dataAmizade,
                mensagem,
                imageUrls,
                youtubeUrl,
                tipoRelacao,
            });

            const savedTimeline = await newTimeline.save();

            // Gerar a URL da timeline usando o _id do MongoDB
            const timelineUrl = `${baseUrl}/timeline/${savedTimeline._id}`;
            console.log('URL gerada para a timeline:', timelineUrl);

            // Atualizar a timeline no banco de dados com a URL gerada
            savedTimeline.timelineUrl = timelineUrl;
            await savedTimeline.save();

            // Gerar o QR Code
            const qrCode = await QRCode.toDataURL(timelineUrl);

            // Enviar o QR Code e a URL da timeline para o frontend
            res.status(200).json({ qrCode, timelineUrl, timelineId: savedTimeline._id });
        } catch (error) {
            console.error('Erro ao salvar a timeline ou gerar o QR Code:', error);
            res.status(500).json({ error: 'Erro ao salvar a timeline ou gerar o QR Code.' });
        }
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
