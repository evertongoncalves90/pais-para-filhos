import { useState, useEffect } from 'react';
import mongoose from 'mongoose';
import Timeline from '../../models/Timeline';
import { FaYoutube } from 'react-icons/fa'; // Importa o ícone do YouTube

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
    const emoji = isAmor ? '❤️' : '💙'; // Vermelho para "amor", azul para "amigo"
    for (let i = 0; i < 50; i++) {
        hearts.push(
            <span
                key={i}
                className="heart"
                style={{
                    left: `${Math.random() * 100}%`, // Posição horizontal aleatória
                    animationDelay: `${Math.random() * 2}s`, // Atraso aleatório para cada coração
                    fontSize: `${Math.random() * 2 + 1}rem`, // Tamanho aleatório
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
    const [showHearts, setShowHearts] = useState(false); // Estado para controlar a exibição dos corações
    const [showPlayer, setShowPlayer] = useState(false); // Controle para exibir ou ocultar o player de áudio
    const [isIOS, setIsIOS] = useState(false); // Estado para detectar iOS

    // Definir o nome da timeline e a mensagem com base no formulário
    const isAmor = tipoRelacao === 'amor'; // Baseado no valor salvo no formulário
    const relacaoOuAmizade = isAmor ? 'Te amando a ❤️:' : 'Amizade para sempre, a: 👊';
    const dataRelacionamento = isAmor ? dataRelacao : dataAmizade;

    // Detecta se é um dispositivo iOS ao montar o componente
    useEffect(() => {
        setIsIOS(isIOSDevice());
    }, []);

    // Controla a exibição dos corações a cada 15 segundos
    useEffect(() => {
        const heartInterval = setInterval(() => {
            setShowHearts(true);
            setTimeout(() => {
                setShowHearts(false);
            }, 4000); // Exibe os corações por 5 segundos
        }, 24000); // Intervalo de 15 segundos

        return () => clearInterval(heartInterval); // Limpa o intervalo quando o componente é desmontado
    }, []);

    // Lógica para calcular o tempo desde a data de relacionamento ou amizade
    useEffect(() => {
        // Certificar-se de que a dataRelacionamento é um objeto Date
        const dateObj = new Date(dataRelacionamento);

        // Verificar se a data é válida
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

    // Lógica para alternar as imagens automaticamente
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [imageUrls]);

    // Função para extrair o ID do vídeo do YouTube
    const getYoutubeVideoId = (url) => {
        let videoId = null;

        // Verifica se a URL está no formato "youtu.be"
        const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortUrlMatch) {
            videoId = shortUrlMatch[1];
        } else {
            // Verifica se a URL está no formato padrão do YouTube
            const standardUrlMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            if (standardUrlMatch) {
                videoId = standardUrlMatch[1];
            }
        }

        return videoId;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-6">
            {/* Container com borda branca e responsividade */}
            <div
                className="p-8 bg-gray-900 text-white rounded-3xl shadow-xl border-4 border-white"
                style={{
                    width: '100%',
                    maxWidth: '80vw',
                    minWidth: '300px',  // Define um tamanho mínimo de largura
                    maxWidth: '1200px',  // Define um tamanho máximo de largura
                    height: 'auto'
                }}

            >
                {/* Se houver uma URL do YouTube */}
                {youtubeUrl && (
                    <div className="mb-4 text-center">
                        {/* Se não for iOS, exibe o ícone do YouTube */}
                        {!isIOS && !showPlayer && (
                            <button onClick={() => setShowPlayer(true)} className="bg-gray-700 p-1 rounded-full">
                                <FaYoutube size={40} className="text-white" />
                            </button>
                        )}

                        {/* Se for iOS, exibe o player diretamente com a mensagem */}
                        {isIOS && (
                            <>
                                <p className="text-center text-gray-400 mt-2 italic">
                                    Dê play para iniciar a música 🎶
                                </p>
                                <iframe className='hidden-player'
                                    width="70"
                                    height="35" // Proporção 16:9
                                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?loop=1&playlist=${getYoutubeVideoId(youtubeUrl)}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            </>
                        )}
                    </div>
                )}

                {/* Exibir o player oculto quando o usuário clicar (para não iOS) */}
                {!isIOS && showPlayer && youtubeUrl && (
                    <iframe
                        width="0"
                        height="0" // Proporção 16:9
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1&loop=1&playlist=${getYoutubeVideoId(youtubeUrl)}`}
                        title="YouTube audio player"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    ></iframe>
                )}

                {/* Imagens com transição automática */}
                <div
                    className="relative w-full rounded-lg overflow-hidden shadow-inner"
                    style={{
                        height: '60vw',           // Altura com base na largura da tela para manter proporção
                        minHeight: '400px',        // Altura mínima para garantir que as imagens não fiquem pequenas
                        maxHeight: '700px'         // Altura máxima para evitar que a caixa fique muito grande
                    }}
                >
                    {imageUrls.length > 0 ? (
                        imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Imagem ${index + 1}`}
                                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-3000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
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

            {/* Corações caindo, exibidos somente se showHearts for true */}
            {showHearts && <div className="hearts-container">{generateHearts(isAmor)}</div>}
        </div>
    );
}
