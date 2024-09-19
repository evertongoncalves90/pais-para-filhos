import { IncomingForm } from 'formidable';
import cloudinary from '../../lib/cloudinary';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Definir o modelo da Timeline no MongoDB (apenas se não existir)
const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', new mongoose.Schema({
    nomeFilhos: String,
    dataNascimento: String,
    mensagem: String,
    imageUrls: [String],
    youtubeUrl: String,
}));

export const config = {
    api: {
        bodyParser: false, // Desabilita o bodyParser padrão do Next.js
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Erro ao processar o formulário:', err);
                res.status(500).json({ error: 'Erro ao processar o upload.' });
                return;
            }

            console.log('Arquivos recebidos:', files);

            if (!files || !files.fotos) {
                console.error('Nenhum arquivo foi recebido.');
                res.status(400).json({ error: 'Nenhum arquivo foi recebido.' });
                return;
            }

            try {
                // Verificar se `files.fotos` é um array ou um único arquivo
                const fotos = Array.isArray(files.fotos) ? files.fotos : [files.fotos];

                // Fazer o upload de todas as fotos
                const uploadPromises = fotos.map(async (file) => {
                    console.log('Tentando enviar o arquivo:', file.originalFilename, 'Caminho:', file.filepath);
                    const result = await cloudinary.uploader.upload(file.filepath, {
                        folder: 'timeline_images',
                    });
                    return result.secure_url;
                });

                const imageUrls = await Promise.all(uploadPromises);

                // Certifique-se de que os valores estão como strings
                const nomeFilhos = Array.isArray(fields.nomeFilhos) ? fields.nomeFilhos[0] : fields.nomeFilhos;
                const dataNascimento = Array.isArray(fields.dataNascimento) ? fields.dataNascimento[0] : fields.dataNascimento;
                const mensagem = Array.isArray(fields.mensagem) ? fields.mensagem[0] : fields.mensagem;
                const youtubeUrl = Array.isArray(fields.youtubeUrl) ? fields.youtubeUrl[0] : fields.youtubeUrl;

                // Armazenar a timeline no banco de dados
                const newTimeline = new Timeline({
                    nomeFilhos,
                    dataNascimento,
                    mensagem,
                    imageUrls,
                    youtubeUrl,
                });

                const savedTimeline = await newTimeline.save();

                // Gerar a URL da timeline
                const timelineUrl = `http://localhost:3000/timeline/${savedTimeline._id}`;
                console.log('URL gerada para a timeline:', timelineUrl);

                // Gerar o QR Code
                const qrCode = await QRCode.toDataURL(timelineUrl);

                // Enviar o QR Code e a URL da timeline para o frontend
                res.status(200).json({ qrCode, timelineUrl });
            } catch (error) {
                console.error('Erro ao salvar a timeline ou gerar o QR Code:', error);
                res.status(500).json({ error: 'Erro ao salvar a timeline ou gerar o QR Code.' });
            }
        });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
