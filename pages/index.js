import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaUpload } from 'react-icons/fa'; // Importa ícone de upload

export default function Home() {
    const [activeTab, setActiveTab] = useState('amor');
    const [nomeCasal, setNomeCasal] = useState('');
    const [dataRelacao, setDataRelacao] = useState('');
    const [horaRelacao, setHoraRelacao] = useState('');
    const [nomeAmigo, setNomeAmigo] = useState('');
    const [dataAmizade, setDataAmizade] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [fotos, setFotos] = useState([]); // Mantém as fotos selecionadas
    const [previewUrl, setPreviewUrl] = useState(null); // URL da imagem pré-visualizada
    const [youtubeUrl, setYoutubeUrl] = useState(''); // Campo para URL do YouTube
    //const [qrCode, setQrCode] = useState(null);
    //const [timelineUrl, setTimelineUrl] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState('');

    const formRef = useRef(null);

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

    useEffect(() => {
        if (activeTab === 'amor' && dataRelacao) {
            const calculateTimeElapsed = () => {
                const startTime = new Date(`${dataRelacao} ${horaRelacao}`);
                const now = new Date();
                const timeDiff = now - startTime;

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
        }
    }, [dataRelacao, horaRelacao, activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        for (let i = 0; i < fotos.length; i++) {
            formData.append('fotos', fotos[i]);
        }

        formData.append('mensagem', mensagem);
        formData.append('youtubeUrl', youtubeUrl);

        if (activeTab === 'amor') {
            formData.append('nomeCasal', nomeCasal);
            formData.append('dataRelacao', `${dataRelacao} ${horaRelacao}`);
        } else {
            formData.append('nomeAmigo', nomeAmigo);
            formData.append('dataAmizade', dataAmizade);
        }

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const { qrCode, timelineUrl } = await res.json();
                setQrCode(qrCode);
                setTimelineUrl(timelineUrl);
            } else {
                console.error('Erro ao enviar as imagens:', res.statusText);
            }
        } catch (error) {
            console.error('Erro ao fazer o upload:', error);
        }
    };

    // Extrai o ID do vídeo do YouTube da URL
    const getYoutubeVideoId = (url) => {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={`min-h-screen p-6 ${activeTab === 'amor' ? 'bg-pink-100' : 'bg-blue-100'}`}>
            {/* Título e descrição centralizados */}
            <div className="text-center mb-10 max-w-3xl mx-auto">
                {activeTab === 'amor' ? (
                    <>
                        <p className="text-6xl font-bold mb-4 text-pink-700 font-dancing-script" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Surpreenda seu amor!
                        </p>
                        <p className="text-lg text-pink-600 font-poppins font-outline" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
                            Crie um contador dinâmico que celebra cada momento do seu relacionamento! Basta preencher o formulário e receberá um site exclusivo, com um QR Code para compartilhar com quem você ama.✨
                        </p>
                        <br></br>
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
                        onSubmit={handleSubmit}
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
                                placeholder="Capricha na mensagem hem? &#128525; &#128526;"
                                onChange={(e) => setMensagem(e.target.value)}
                                required
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
                                accept="image/*"
                                onChange={(e) => setFotos(Array.from(e.target.files))}
                                className="hidden"
                            />
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
                                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md ${activeTab === 'amor' ? 'bg-pink-100' : 'bg-blue-100'}`}
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full text-white p-3 rounded-lg ${activeTab === 'amor' ? 'bg-pink-600' : 'bg-blue-600'}`}
                        >
                            Criar minha Timeline
                        </button>
                    </form>
                </div>

                {/* Prévia da Timeline */}
                <div className="flex-1 mt-20 lg:mt-w-full lg:w-5/12 p-8 bg-gray-900 rounded-lg shadow-lg lg:ml-10 shadow-lg p-6 max-w-md w-full">
                    <h2 className="text-center text-lg font-bold mb-4 text-white">Veja como vai ficar</h2>
                    <div className="relative h-64 w-full bg-gray-800 rounded-lg overflow-hidden shadow-inner">
                        {fotos.length > 0 && previewUrl ? (
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <p className="text-center text-gray-400">Adicione fotos para visualizar</p>
                        )}
                    </div>
                    <div className="text-center mt-4 text-white">
                        <p className="font-semibold">
                            {activeTab === 'amor' ? '❤️ Te amando a:' : 'Amizade para sempre, a:'}
                        </p>
                        <p className="mt-2 text-gray-300">{timeElapsed || 'Aguardando data...'}</p>
                    </div>
                    <hr className="my-4 border-gray-500" />
                    <div className="text-center text-gray-400">
                        <p className="italic">{mensagem || 'Sua mensagem aparecerá aqui'}</p>
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

                    {/* Segundo botão de "Criar minha Timeline" */}
                    <button
                        onClick={handleSubmit}
                        className={`w-full p-3 mt-4 rounded-lg ${activeTab === 'amor' ? 'bg-pink-700' : 'bg-blue-500'} text-white`}
                    >
                        Criar minha Timeline
                    </button>
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
                        <p className="text-white font-bold text-lg">3 - Receba seu site com QR Code &#128525;</p>
                    </div>
                    <div className="p-4 border-pink-700 border-2 rounded-lg">
                        <p className="text-white font-bold text-lg">4 - Faça a surpresa! &#127873;</p>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <button onClick={scrollToForm} className="bg-pink-700 border-white-100 border-2 text-white p-3 rounded-lg">
                        Criar agora minha timeline
                    </button>
                </div>
            </div>

            {/* Seção "Perguntas Frequentes (FAQ)" */}
            <div className="mt-10 bg-gray-900 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Perguntas Frequentes (FAQ)</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">O que é a Loveyuu?</p>
                        <p className="mt-2">Loveyuu é uma plataforma que permite criar páginas personalizadas de relacionamento para casais. Você pode adicionar fotos, uma mensagem especial e um contador que mostra há quanto tempo vocês estão juntos.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">Como posso criar uma página personalizada na Loveyuu?</p>
                        <p className="mt-2">Para criar uma página personalizada, preencha o formulário com os nomes do casal, a data de início do relacionamento, uma mensagem de declaração e até 5 fotos. Depois, clique no botão &quot;Criar Casal&quot; e finalize o pagamento.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">O que está incluído na minha página personalizada?</p>
                        <p className="mt-2">Sua página personalizada incluirá um contador ao vivo mostrando há quanto tempo vocês estão juntos, uma apresentação de slides com suas fotos e uma mensagem especial de declaração.</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <p className="font-bold">Como recebo minha página personalizada após o pagamento?</p>
                        <p className="mt-2">Após a conclusão do pagamento, você receberá um QR code para compartilhar com seu parceiro(a) e um link via e-mail para acessar a página.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
