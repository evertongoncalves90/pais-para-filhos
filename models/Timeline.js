import mongoose from 'mongoose';

const TimelineSchema = new mongoose.Schema({
    nomeCasal: String,
    dataRelacao: String,
    nomeAmigo: String,
    dataAmizade: String,
    mensagem: String,
    imageUrls: [String],
    youtubeUrl: String,
    tipoRelacao: String,
    timelineUrl: String, // Para armazenar a URL gerada
    timelineId: String // Adicionando este campo
});

const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', TimelineSchema);

export default Timeline;