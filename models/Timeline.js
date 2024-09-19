import mongoose from 'mongoose';

const TimelineSchema = new mongoose.Schema({
    nomeFilhos: String,
    dataNascimento: String,
    mensagem: String,
    imageUrls: [String],
    youtubeUrl: String, // Novo campo para o link do YouTube
});

export default mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema);
