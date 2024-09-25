import { useState, useEffect } from 'react';
import mongoose from 'mongoose';
import Timeline from '../../models/Timeline';
import { FaYoutube } from 'react-icons/fa';

export async function getServerSideProps(context) {
    const { id } = context.params;

    // Conectar ao MongoDB e buscar a timeline pelo ID
    await mongoose.connect(process.env.MONGODB_URI);
    const timeline = await Timeline.findById(id).lean();

    if (!timeline) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            timeline: JSON.parse(JSON.stringify(timeline)),
        },
    };
}

// Função para detectar se o dispositivo é iOS
const isIOSDevice = () => {
    return (
        typeof navigator !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !window.MSStream
    );
};

// Função para gerar emojis de coração caindo
const generateHearts = (isAmor) => {
    const hearts = [];
    const emoji = isAmor ? '❤️' : '💙';
    for (let i = 0; i < 50; i++) {
        hearts.push(
            <span
                key={i}
                className="heart"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    fontSize: `${Math.random() * 2 + 1}rem`,
                }}
            >
                {emoji}
            </span>
        );
    }
    return hearts;
};

export default function TimelinePage({ timeline }) {
    const { dataRelacao, dataAmizade, mensagem, imageUrls, youtubeUrl, tipoRelacao } = timeline;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState('');
    const [showHearts, setShowHearts] = useState(false);
    const [hidePlayer, setHidePlayer] = useState(false);

    const isAmor = tipoRelacao === 'amor';
    const relacaoOuAmizade = isAmor ? 'Te amando a ❤️:' : 'Amizade para sempre, a: 👊';
    const dataRelacionamento = isAmor ? dataRelacao : dataAmizade;

    useEffect(() => {
        // Controla a exibição dos corações
        const heartInterval = setInterval(() => {
            setShowHearts(true);
            setTimeout(() => {
                setShowHearts(false);
            }, 4000);
        }, 24000);

        return () => clearInterval(heartInterval);
    }, []);

    useEffect(() => {
        // Calcula o tempo decorrido
        const dateObj = new Date(dataRelacionamento);

        if (isNaN(dateObj.getTime())) {
            setTimeElapsed('Data inválida');
            return;
        }

        const calculateTimeElapsed = () => {
            const now = new Date();
            const timeDiff = now - dateObj;

            const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
            const months = Math.floor(
                (timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30)
            );
            const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            setTimeElapsed(`${years} anos, ${months} meses, ${days} dias, ${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeElapsed();
        const timer = setInterval(calculateTimeElapsed, 1000);

        return () => clearInterval(timer);
    }, [dataRelacionamento]);

    useEffect(() => {
        // Alterna as imagens automaticamente
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [imageUrls]);

    // Função para extrair o ID do vídeo do YouTube
    const getYoutubeVideoId = (url) => {
        let videoId = null;
        const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortUrlMatch) {
            videoId = shortUrlMatch[1];
        } else {
            const standardUrlMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            if (standardUrlMatch) {
                videoId = standardUrlMatch[1];
            } else {
                const embedUrlMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
                if (embedUrlMatch) {
                    videoId = embedUrlMatch[1];
                }
            }
        }
        return videoId;
    };

    const handlePlayButtonClick = () => {
        setHidePlayer(false);
        console.log('Player mostrado');

        setTimeout(() => {
            setHidePlayer(true);
            console.log('Player ocultado');
        }, 3000); // Ajuste o tempo conforme necessário
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-6">
            {/* Container com borda branca e responsividade */}
            <div
                className="p-8 bg-gray-900 text-white rounded-3xl shadow-xl border-4 border-white"
                style={{
                    width: '100%',
                    maxWidth: '80vw',
                    minWidth: '300px',
                    height: 'auto',
                }}
            >
                {/* Botão para tocar a música */}
                {youtubeUrl && (
                    <div className="mb-4 text-center">
                        <button onClick={handlePlayButtonClick} className="bg-gray-700 p-1 rounded-full">
                            <FaYoutube size={40} className="text-white" />
                        </button>
                        {/* Exibe mensagem apenas para dispositivos iOS */}
                        {isIOSDevice() && (
                            <p className="text-center text-gray-400 mt-2 italic">
                                Toque no botão acima para iniciar a música 🎶.
                            </p>
                        )}
                    </div>
                )}

                {/* Player do YouTube */}
                {youtubeUrl && (
                    <div className={`mb-4 text-center ${hidePlayer ? 'hidden-player' : ''}`}>
                        <iframe
                            id="youtube-player"
                            width="360"
                            height="203"
                            src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1&loop=1&playlist=${getYoutubeVideoId(youtubeUrl)}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* Imagens com transição automática */}
                <div
                    className="relative w-full rounded-lg overflow-hidden shadow-inner"
                    style={{
                        height: '60vw',
                        minHeight: '400px',
                        maxHeight: '700px',
                    }}
                >
                    {imageUrls.length > 0 ? (
                        imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Imagem ${index + 1}`}
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-3000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-400">Adicione fotos para visualizar</p>
                    )}
                </div>

                {/* Exibição do tempo de relacionamento ou amizade */}
                <div className="text-center mt-4 text-white">
                    <h2 className="text-2xl font-bold mb-2">{relacaoOuAmizade}</h2>
                    <p className="text-lg">{timeElapsed}</p>
                </div>

                <hr className="my-4 border-gray-700" />

                {/* Mensagem personalizada */}
                <div className="text-center text-gray-400">
                    <p className="text-lg italic" style={{ whiteSpace: 'pre-line' }}>
                        💌 {mensagem || 'Mensagem não fornecida'}
                    </p>
                </div>
            </div>

            {/* Corações caindo */}
            {showHearts && <div className="hearts-container">{generateHearts(isAmor)}</div>}
        </div>
    );
}
