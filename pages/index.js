import { useState, useEffect, useRef } from 'react';
import { FaUpload, FaWhatsapp, FaEnvelope, FaInstagram } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import Modal from '../components/Modal';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Função para fazer upload das imagens para o Cloudinary
const uploadImages = async (files) => {
    const uploadedImageUrls = [];

    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned_timeline_upload'); // Substitua pelo nome do seu Upload Preset

        const response = await fetch('https://api.cloudinary.com/v1_1/dmmuuq98x/image/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        uploadedImageUrls.push(data.secure_url);
    }

    return uploadedImageUrls;
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

export default function Home() {
    const [activeTab, setActiveTab] = useState('amor');
    const [nomeCasal, setNomeCasal] = useState('');
    const [dataRelacao, setDataRelacao] = useState('');
    const [horaRelacao, setHoraRelacao] = useState('');
    const [nomeAmigo, setNomeAmigo] = useState('');
    const [dataAmizade, setDataAmizade] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [fotos, setFotos] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState('');
    const formRef = useRef(null);
    const [showHearts, setShowHearts] = useState(false); // Estado para controlar a exibição dos corações
    const [loading, setLoading] = useState(false); // Adiciona o estado de loading
    const [fotosError, setFotosError] = useState('');


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

    // Atualiza a URL de pré-visualização da imagem quando as fotos mudam
    useEffect(() => {
        if (fotos.length > 0) {
            const objectUrl = URL.createObjectURL(fotos[currentImageIndex]);
            setPreviewUrl(objectUrl);

            // Limpa o objeto URL quando não for mais necessário
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [fotos, currentImageIndex]);

    // Alterna entre imagens selecionadas a cada 3 segundos
    useEffect(() => {
        if (fotos.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % fotos.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [fotos]);

    // Calcula o tempo desde o início do relacionamento ou amizade
    useEffect(() => {
        const calculateTimeElapsed = () => {
            let startDate;
            if (activeTab === 'amor') {
                startDate = new Date(`${dataRelacao} ${horaRelacao}`);
            } else {
                startDate = new Date(dataAmizade);
            }
            const currentDate = new Date();
            const timeDiff = currentDate - startDate;

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

        if ((activeTab === 'amor' && dataRelacao && horaRelacao) || (activeTab === 'amigo' && dataAmizade)) {
            calculateTimeElapsed();
            const timer = setInterval(calculateTimeElapsed, 1000);

            return () => clearInterval(timer);
        }
    }, [dataRelacao, horaRelacao, dataAmizade, activeTab]);

    // Extrai o ID do vídeo do YouTube da URL
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

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true); // Define o estado de loading como verdadeiro

        try {
            // Fazer o upload das imagens para o Cloudinary
            const imageUrls = await uploadImages(fotos);

            // Criar o objeto com os dados do formulário
            const formData = {
                mensagem,
                youtubeUrl,
                imageUrls,
                tipoRelacao: activeTab === 'amor' ? 'amor' : 'amigo',
            };

            if (activeTab === 'amor') {
                formData.nomeCasal = nomeCasal;
                formData.dataRelacao = `${dataRelacao} ${horaRelacao}`;
            } else {
                formData.nomeAmigo = nomeAmigo;
                formData.dataAmizade = dataAmizade;
            }

            // Enviar os dados para o servidor (agora em formato JSON)
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!uploadResponse.ok) {
                throw new Error('Erro ao enviar os dados do formulário.');
            }

            // Receber a URL da timeline criada ou usar a URL local
            const { timelineId } = await uploadResponse.json(); // Receba o `timelineId` gerado pelo MongoDB

            if (!timelineId) {
                throw new Error('Erro ao gerar o timelineId');
            }

            // Faz a requisição para criar a sessão de pagamento no Stripe
            const paymentResponse = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nomeCasal,
                    dataRelacao,
                    nomeAmigo,
                    dataAmizade,
                    mensagem,
                    tipoRelacao: activeTab === 'amor' ? 'amor' : 'amigo',
                    timelineId, // Enviar o timelineId para o servidor
                }),
            });

            const { sessionId } = await paymentResponse.json();

            if (sessionId) {
                const stripe = await stripePromise;
                const { error } = await stripe.redirectToCheckout({ sessionId });

                if (error) {
                    console.error('Erro ao redirecionar para o Checkout:', error);
                    setLoading(false); // Remove o loading em caso de erro
                }
            } else {
                console.error('Erro ao criar a sessão de pagamento');
                setLoading(false); // Remove o loading em caso de erro
            }
        } catch (error) {
            console.error('Erro ao processar a geração da página e o pagamento:', error);
            setLoading(false); // Remove o loading em caso de erro
        }
    };

    return (
        <div className={`min-h-screen p-6 ${activeTab === 'amor' ? 'bg-pink-100' : 'bg-blue-100'}`}>

            <header className="flex flex-col items-center justify-center mb-6">
                <h1 className="text-lg font-bold text-pink-900 font-dancing-script">Surprise for Love</h1>
            </header>

            {/* Título e descrição centralizados */}
            {/*<div className="bg-gray-800">*/}
            <div className="text-center mb-10 max-w-3xl mx-auto">
                {activeTab === 'amor' ? (
                    <>
                        <p className="text-6xl font-bold mb-4 text-pink-700 font-dancing-script" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Surpreenda seu amor!
                        </p>
                        <p className="text-lg text-pink-600 font-poppins font-outline" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Crie um contador dinâmico que celebra cada momento do seu relacionamento! Basta preencher o formulário e receberá um site exclusivo, com um QR Code para compartilhar com quem você ama.✨
                        </p>
                        <br />
                        <p className="text-lg text-pink-600 font-poppins font-outline" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Transforme suas memórias em um tributo emocionante que fica sempre à vista! 💖
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-6xl font-bold mb-4 text-yellow-600" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Amizade de forma única!
                        </p>
                        <p className="text-lg font-outline" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Crie um contador dinâmico que homenageia cada aventura com seu amigo! Preencha o formulário e receba um site exclusivo, completo com um QR Code para compartilhar com seu parceiro de aventuras. Transforme suas memórias em uma celebração emocionante que eterniza a força da sua amizade! 🤗💫
                        </p>
                    </>
                )}
            </div>
            {/*</div>

            {/* Formulário e prévia lado a lado */}
            <div className="flex flex-col lg:flex-row lg:space-x-10 items-center lg:items-start justify-center" ref={formRef}>
                {/* Formulário */}
                <div className="flex-1 w-full max-w-5xl">
                    <div className="flex space-x-4 mb-8 justify-center">
                        <button
                            onClick={() => setActiveTab('amor')}
                            className={`p-2 rounded-lg ${activeTab === 'amor' ? 'bg-pink-700 text-white border-pink-500 border-2' : 'bg-gray-200'}`}
                        >
                            Para um amor
                        </button>
                        <button
                            onClick={() => setActiveTab('amigo')}
                            className={`p-2 rounded-lg ${activeTab === 'amigo' ? 'bg-blue-900 text-yellow-500 border-yellow-500 border-2' : 'bg-gray-200'}`}
                        >
                            Para um(a) amigo(a)
                        </button>
                    </div>

                    <form
                        onSubmit={handlePayment}
                        className={`w-full p-8 rounded-lg shadow border-4 border-white ${activeTab === 'amor' ? 'bg-pink-200' : 'bg-blue-200'} font-poppins`}
                    >
                        {/* Campos de formulário */}
                        {activeTab === 'amor' ? (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="nomeCasal" className="block text-sm font-bold">
                                        Nome do Casal
                                    </label>
                                    <input
                                        type="text"
                                        id="nomeCasal"
                                        placeholder="Ex: Romeu e Julieta"
                                        value={nomeCasal}
                                        onChange={(e) => setNomeCasal(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-pink-100"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="dataRelacao" className="block text-sm font-bold">
                                        Data de Início do Relacionamento
                                    </label>
                                    <input
                                        type="date"
                                        id="dataRelacao"
                                        value={dataRelacao}
                                        onChange={(e) => setDataRelacao(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-pink-100"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="horaRelacao" className="block text-sm font-bold">
                                        Hora do Início
                                    </label>
                                    <input
                                        type="time"
                                        id="horaRelacao"
                                        value={horaRelacao}
                                        onChange={(e) => setHoraRelacao(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-pink-100"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="nomeAmigo" className="block text-sm font-bold">
                                        Nome do(a) Amigo(a)
                                    </label>
                                    <input
                                        type="text"
                                        id="nomeAmigo"
                                        value={nomeAmigo}
                                        placeholder="Ex: Julia"
                                        onChange={(e) => setNomeAmigo(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-100"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="dataAmizade" className="block text-sm font-bold">
                                        Data de Início da Amizade
                                    </label>
                                    <input
                                        type="date"
                                        id="dataAmizade"
                                        value={dataAmizade}
                                        onChange={(e) => setDataAmizade(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-blue-100"
                                    />
                                </div>
                            </>
                        )}

                        <div className="mb-4">
                            <label htmlFor="mensagem" className="block text-sm font-bold">
                                Mensagem Personalizada
                            </label>
                            <textarea
                                id="mensagem"
                                value={mensagem}
                                placeholder="Capricha na mensagem hem? 😊 😎"
                                onChange={(e) => setMensagem(e.target.value)}
                                required
                                disabled={loading}
                                rows="6"  // Ajusta o número de linhas visíveis no textarea
                                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md ${activeTab === 'amor' ? 'bg-pink-100' : 'bg-blue-100'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="fotos" className="block text-sm font-bold">
                                Escolha suas fotos (Até 10)
                            </label>
                            <label
                                className="cursor-pointer flex items-center justify-center border border-dashed border-gray-400 p-3 rounded-lg bg-white"
                                htmlFor="fotos"
                            >
                                <FaUpload className="mr-2" />
                                {fotos.length > 0 ? `${fotos.length} fotos selecionadas` : 'Escolha suas fotos'}
                            </label>
                            <input
                                type="file"
                                id="fotos"
                                multiple
                                disabled={loading}
                                accept="image/*"
                                onChange={(e) => {
                                    const selectedFiles = Array.from(e.target.files);
                                    const totalFiles = fotos.length + selectedFiles.length;

                                    if (totalFiles > 10) {
                                        setFotosError('Você pode selecionar no máximo 10 fotos no total.');
                                        e.target.value = null;
                                    } else {
                                        setFotosError('');
                                        setFotos(prevFotos => [...prevFotos, ...selectedFiles]);
                                        e.target.value = null;
                                    }
                                }}
                                className="hidden"
                            />
                            {fotosError && (
                                <p className="text-red-500 text-sm mt-2">{fotosError}</p>
                            )}
                            {fotos.length > 0 && (
                                <div className="mt-2">
                                    <ul>
                                        {fotos.map((file, index) => (
                                            <li key={index} className="flex justify-between items-center">
                                                <span>{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updatedFotos = fotos.filter((_, i) => i !== index);
                                                        setFotos(updatedFotos);
                                                        setFotosError('');
                                                    }}
                                                    className="text-red-500 text-sm"
                                                >
                                                    Remover
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFotos([]);
                                            setFotosError('');
                                        }}
                                        className="mt-2 text-red-500 underline"
                                    >
                                        Remover todas as fotos
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="youtubeUrl" className="block text-sm font-bold">
                                Link do YouTube (opcional)
                            </label>
                            <input
                                type="url"
                                id="youtubeUrl"
                                placeholder="https://www.youtube.com/watch?v=Ftnki5njNbw&ab_channel=HenriqueeDiegoVEVO"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                disabled={loading}
                                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md ${activeTab === 'amor' ? 'bg-pink-100' : 'bg-blue-100'}`}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full text-white p-3 rounded-lg ${activeTab === 'amor' ? 'bg-pink-600' : 'bg-blue-600'}`}
                            disabled={loading}
                        >
                            {loading ? 'Sua página personalizada está sendo criada, aguarde...' : 'Criar minha Página personalizada'}
                        </button>

                        <div className="p-4 rounded-lg mb-4 lg:mb-0">
                            <p className="text-gray-800 font-bold text-lg">por R$ 21,90 &#128176;</p>
                        </div>
                    </form>
                    {/* Modal de carregamento */}
                    <Modal
                        isVisible={loading}
                        message="Aguarde, estamos criando sua página personalizada ❤️"
                    />
                </div>

                {/* Prévia da Timeline */}
                <div className="flex-1 mt-20 lg:mt-10 shadow-lg p-8 max-w-md w-full">
                    <div
                        className="p-8 bg-gray-900 text-white rounded-3xl shadow-xl "
                        style={{
                            width: '100%',
                            minWidth: '300px',
                            height: 'auto',
                        }}
                    >
                        <h2 className="text-center text-lg font-bold mb-4 text-white">Veja como vai ficar</h2>

                        <div
                            className="relative w-full rounded-lg overflow-hidden shadow-inner border-2 border-white"
                            style={{
                                height: '40vw', // Mantenha altura ajustável conforme necessário
                                minHeight: '250px',
                                maxHeight: '400px',
                            }}
                        >
                            {fotos.length > 0 && previewUrl ? (
                                // Para imagens locais
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-3000 ease-in-out"
                                />
                            ) : (
                                <p className="text-center text-gray-400">Adicione fotos para visualizar</p>
                            )}

                            {/* Corações caindo, exibidos somente se showHearts for true */}
                            {showHearts && <div className="hearts-container">{generateHearts(activeTab === 'amor')}</div>}
                        </div>

                        <div className="text-center mt-4 text-white">
                            <p className="font-semibold">
                                {activeTab === 'amor' ? '❤️ Te amando a:' : '👊 Amizade para sempre, a:'}
                            </p>
                            <p className="mt-2 text-gray-300">{timeElapsed || 'Aguardando data...'}</p>
                        </div>

                        <hr className="my-4 border-gray-700" />

                        <div className="text-center text-gray-400">
                            <p className="italic text-lg" style={{ whiteSpace: 'pre-line' }}>
                                {mensagem || 'Sua mensagem aparecerá aqui'}
                            </p>
                        </div>
                    </div>
                    {/* Se o campo youtubeUrl estiver preenchido, exibe o iframe com autoplay */}
                    {youtubeUrl && (
                        <div className="mt-6">
                            <iframe
                                width="0"
                                height="0"
                                src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1&loop=1&playlist=${getYoutubeVideoId(youtubeUrl)}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>

            {/* Seção "Como fazer?" */}
            <div className="mt-10 bg-gray-900 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Como fazer?</h2>
                <div className="flex flex-col lg:flex-row justify-around items-center lg:space-x-4">
                    <div className="p-4 border-pink-700 border-2 rounded-lg mb-4 lg:mb-0">
                        <p className="text-white font-bold text-lg">1 - Preencha os dados e escolha as fotos &#128248;</p>
                    </div>
                    <div className="p-4 border-pink-700 border-2 rounded-lg mb-4 lg:mb-0">
                        <p className="text-white font-bold text-lg">2 - Faça o pagamento &#128176;</p>
                    </div>
                    <div className="p-4 border-pink-700 border-2 rounded-lg mb-4 lg:mb-0">
                        <p className="text-white font-bold text-lg">3 - Receba seu site com QR Code e link de acesso a sua página criada &#128525;</p>
                    </div>
                    <div className="p-4 border-pink-700 border-2 rounded-lg">
                        <p className="text-white font-bold text-lg">4 - Faça a surpresa! &#127873;</p>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <button onClick={scrollToForm} className="bg-pink-700 border-white-100 border-2 text-white p-3 rounded-lg">
                        {loading ? 'Sua página personalizada está sendo criada, aguarde...' : 'Criar minha Página personalizada'}
                    </button>
                </div>
            </div>

            {/* Seção "Perguntas Frequentes (FAQ)" */}
            <div className="mt-10 bg-gray-900 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Perguntas Frequentes (FAQ)</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">O que é a Surprise for Love?</p>
                        <p className="mt-2">É uma plataforma que permite criar uma página totalmente exclusiva de relacionamento para casais e ou para presentear amigos. Você pode adicionar fotos, uma mensagem especial, uma música e um contador que mostra há quanto tempo vocês estão juntos.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">Qual o valor para criar minha página personalizada?</p>
                        <p className="mt-2">Para criar sua página personalizado, o valor é de R$ 21,90. Atualmente somente via cartão de crédito, mas estamos trabalhando para aceitarmos outras formas de pagamento como boleto e pix.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">O que está incluído na minha página personalizado?</p>
                        <p className="mt-2">Sua página personalizada incluirá um contador ao vivo mostrando há quanto tempo vocês estão juntos, uma apresentação de slides com suas fotos, sua música escolhida e uma mensagem especial de declaração.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">O que está incluído na minha página personalizado?</p>
                        <p className="mt-2">Sua página personalizada incluirá um contador ao vivo mostrando há quanto tempo vocês estão juntos, uma apresentação de slides com suas fotos, sua música escolhida e uma mensagem especial de declaração.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">Como recebo minha página personalizada após o pagamento?</p>
                        <p className="mt-2">Após a confirmação do pagamento, você receberá um QR Code para compartilhar com seu presenteado e fazer aquela bela surpresa.</p>
                    </div>
                </div>
            </div>
            {/* Rodapé com opções de contato */}
            <footer className="mt-12 w-full bg-gray-800 text-white py-6">
                <div className="flex justify-center items-center space-x-6">
                    <a
                        href="mailto:forlovesurprise@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-400"
                    >
                        <FaEnvelope size={30} />
                    </a>
                    <a
                        href="https://wa.me/5531996893519" // Substitua pelo seu número do WhatsApp
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-400"
                    >
                        <FaWhatsapp size={30} />
                    </a>
                    <a
                        href="https://www.instagram.com/surpriseforlove_ofi" // Substitua pelo seu perfil do Instagram
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-400"
                    >
                        <FaInstagram size={30} />
                    </a>
                </div>

                <div className="text-center mt-4 text-gray-400 text-sm">
                    © {new Date().getFullYear()} SurpriseForLove. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
