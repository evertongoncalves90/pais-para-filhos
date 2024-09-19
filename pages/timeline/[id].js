import { useState, useEffect } from 'react';
import mongoose from 'mongoose';
import Timeline from '../../models/Timeline'; // Importar o modelo corretamente

export async function getServerSideProps(context) {
    const { id } = context.params;

    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Buscar a timeline no MongoDB
    const timeline = await Timeline.findById(id).lean();

    return {
        props: {
            timeline: JSON.parse(JSON.stringify(timeline)),
        },
    };
}

export default function TimelinePage({ timeline }) {
    const { nomeFilhos, dataNascimento, mensagem, imageUrls, youtubeUrl } = timeline; // Alterado de youtubeLink para youtubeUrl
    const [timeElapsed, setTimeElapsed] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Calcular o tempo desde o nascimento
    useEffect(() => {
        const calculateTimeElapsed = () => {
            const birthDate = new Date(dataNascimento);
            const currentDate = new Date();
            const timeDiff = currentDate - birthDate;

            const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
            const months = Math.floor(
                (timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30)
            );
            const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));

            setTimeElapsed(`${years} anos, ${months} meses, ${days} dias`);
        };

        calculateTimeElapsed();
        const timer = setInterval(calculateTimeElapsed, 1000);

        return () => clearInterval(timer);
    }, [dataNascimento]);

    // Lógica para alternar as imagens automaticamente com transições suaves
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [imageUrls]);

    // Extrair o ID do vídeo do YouTube
    const youtubeVideoId = youtubeUrl ? youtubeUrl.split('v=')[1].split('&')[0] : null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-green-200">
            <div className="p-6 bg-gradient-to-r from-blue-300 via-green-200 to-yellow-300 rounded-3xl shadow-xl w-full max-w-lg">
                {/* Cabeçalho com nome do filho */}
                <h1 className="text-4xl font-extrabold text-blue-600 mb-4 text-center border-b-2 border-blue-400 pb-2">
                    🎁 Timeline de {nomeFilhos}
                </h1>

                {/* Transição de imagens com fundo suave azul e verde */}
                <div className="relative w-full max-w-lg h-96 mt-8 rounded-xl overflow-hidden shadow-md border-4 border-yellow-300 bg-gradient-to-r from-blue-400 via-green-300 to-yellow-400">
                    {imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Imagem ${index + 1}`}
                            className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                </div>

                {/* Reproduzir vídeo do YouTube */}
                {youtubeVideoId && (
                    <div className="mt-8 w-full max-w-lg">
                        <iframe
                            width="0"
                            height="0"
                            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=0&showinfo=0&loop=1&playlist=${youtubeVideoId}`}
                            frameBorder="0"
                            allow="autoplay"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Contador de tempo de paternidade */}
                <div className="mt-8 text-center p-4 bg-gradient-to-r from-yellow-300 to-green-300 rounded-lg shadow-inner">
                    <h2 className="text-2xl font-bold text-green-700 mb-2">⏳ Tempo de Paternidade</h2>
                    <p className="text-xl text-gray-700">{timeElapsed}</p>
                </div>

                {/* Mensagem personalizada */}
                <div className="mt-6 p-4 bg-blue-100 rounded-lg shadow-lg text-center">
                    <p className="text-lg font-semibold text-green-600 italic">💌 {mensagem}</p>
                </div>
            </div>
        </div>
    );
}
