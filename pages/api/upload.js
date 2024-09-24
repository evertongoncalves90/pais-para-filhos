import { IncomingForm } from 'formidable';
import cloudinary from '../../lib/cloudinary';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Default para localhost caso esteja em ambiente de desenvolvimento

// Definir o modelo da Timeline no MongoDB (apenas se não existir)
const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', new mongoose.Schema({
    nomeCasal: String,
    dataRelacao: String,
    nomeAmigo: String,
    dataAmizade: String,
    mensagem: String,
    imageUrls: [String],
    youtubeUrl: String,
    tipoRelacao: String, // Campo novo para armazenar o tipo de relação
}));

export const config = {
    api: {
        bodyParser: false, // Desabilita o bodyParser padrão do Next.js
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new IncomingForm({
            multiples: true, // Permite múltiplos arquivos
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Erro ao processar o formulário:', err);
                res.status(500).json({ error: 'Erro ao processar o upload.' });
                return;
            }

            console.log('Arquivos recebidos:', files);
            // Verificar se os campos foram recebidos corretamente
            console.log('Campos recebidos:', fields); // Certifique-se de que `tipoRelacao` está presente aqui

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

                // Corrigir o tratamento de campos como strings
                const mensagem = Array.isArray(fields.mensagem) ? fields.mensagem[0] : fields.mensagem;
                const youtubeUrl = Array.isArray(fields.youtubeUrl) ? fields.youtubeUrl[0] : fields.youtubeUrl;
                const nomeCasal = Array.isArray(fields.nomeCasal) ? fields.nomeCasal[0] : fields.nomeCasal;
                const dataRelacao = Array.isArray(fields.dataRelacao) ? fields.dataRelacao[0] : fields.dataRelacao;
                const nomeAmigo = Array.isArray(fields.nomeAmigo) ? fields.nomeAmigo[0] : fields.nomeAmigo;
                const dataAmizade = Array.isArray(fields.dataAmizade) ? fields.dataAmizade[0] : fields.dataAmizade;
                const tipoRelacao = Array.isArray(fields.tipoRelacao) ? fields.tipoRelacao[0] : fields.tipoRelacao; // Adiciona o tipo de relacionamento
                //const timelineId = Array.isArray(fields.timelineId) ? fields.timelineId[0] : fields.timelineId; // Aqui você obtém o timelineId passado no formulário

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
                    // Não precisa mais do campo timelineId
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
                res.status(200).json({ qrCode, timelineUrl, timelineId: savedTimeline._id });  // Retorne o `timelineId` correto
                console.log('ID Enviado para o frontend' + res.status(200).json({ qrCode, timelineUrl, timelineId: savedTimeline._id }))

            } catch (error) {
                console.error('Erro ao salvar a timeline ou gerar o QR Code:', error);
                res.status(500).json({ error: 'Erro ao salvar a timeline ou gerar o QR Code.' });
            }
        });
    } else {
        res.status(405).json({ message: 'Método não permitido' });
    }
}
