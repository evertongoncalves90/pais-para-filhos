import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp, FaEnvelope, FaInstagram } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion'; // Para animações
import Modal from '../components/Modal';
import PaymentModal from '../components/PaymentModal';
import { useRouter } from 'next/router';

// --- CONFIGURAÇÕES E FUNÇÕES HELPERS ---

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const uploadImages = async (files) => {
    const uploadedImageUrls = [];
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned_timeline_upload');
        const response = await fetch('https://api.cloudinary.com/v1_1/dmmuuq98x/image/upload', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        uploadedImageUrls.push(data.secure_url);
    }
    return uploadedImageUrls;
};

const generateHearts = (isAmor) => {
    const hearts = [];
    const emoji = isAmor ? '❤️' : '💙';
    for (let i = 0; i < 50; i++) {
        hearts.push(
            <span key={i} className="heart" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, fontSize: `${Math.random() * 2 + 1}rem` }}>
                {emoji}
            </span>
        );
    }
    return hearts;
};

const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortUrlMatch) return shortUrlMatch[1];
    const standardUrlMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (standardUrlMatch) return standardUrlMatch[1];
    return null;
};

// --- COMPONENTES DE UI ESTILIZADOS ---

const StepProgressBar = ({ currentStep, totalSteps }) => (
    <div className="w-full bg-gray-200/50 rounded-full h-2 mb-10">
        <motion.div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        />
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function Home() {
    // --- ESTADOS DO COMPONENTE ---
    const [activeTab, setActiveTab] = useState('amor');
    const [currentStep, setCurrentStep] = useState(1);
    const [nomeCasal, setNomeCasal] = useState('');
    const [dataRelacao, setDataRelacao] = useState('');
    const [horaRelacao, setHoraRelacao] = useState('');
    const [nomeAmigo, setNomeAmigo] = useState('');
    const [dataAmizade, setDataAmizade] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [fotos, setFotos] = useState([]);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState('Aguardando data...');
    const [showHearts, setShowHearts] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fotosError, setFotosError] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [timelineId, setTimelineId] = useState(null);
    const creationFormRef = useRef(null);
    const router = useRouter();

    // --- EFEITOS (useEffect) ---

    useEffect(() => {
        const heartInterval = setInterval(() => {
            setShowHearts(true);
            setTimeout(() => setShowHearts(false), 4000);
        }, 24000);
        return () => clearInterval(heartInterval);
    }, []);

    useEffect(() => {
        if (fotos.length > 0) {
            const objectUrl = URL.createObjectURL(fotos[currentImageIndex]);
            setPreviewUrl(objectUrl);
            const interval = fotos.length > 1 ? setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % fotos.length);
            }, 3000) : null;
            return () => {
                URL.revokeObjectURL(objectUrl);
                if (interval) clearInterval(interval);
            };
        } else {
            setPreviewUrl(null);
        }
    }, [fotos, currentImageIndex]);

    useEffect(() => {
        const calculateTime = () => {
            const startDateStr = activeTab === 'amor' ? `${dataRelacao} ${horaRelacao}` : dataAmizade;
            if (!startDateStr.trim() || (activeTab === 'amor' && (!dataRelacao || !horaRelacao))) {
                setTimeElapsed('Aguardando data...');
                return;
            }

            const dateParts = (activeTab === 'amor' ? dataRelacao : dataAmizade).split(/[/.-]/);
            const timeParts = horaRelacao.split(':');
            let startDate;

            if (dateParts.length === 3) {
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1; // Mês é 0-indexed
                const year = parseInt(dateParts[2], 10);

                if (activeTab === 'amor' && timeParts.length >= 2) {
                    const hour = parseInt(timeParts[0], 10);
                    const minute = parseInt(timeParts[1], 10);
                    startDate = new Date(year, month, day, hour, minute);
                } else {
                    startDate = new Date(year, month, day);
                }
            } else {
                startDate = new Date(startDateStr);
            }

            if (isNaN(startDate.getTime())) {
                setTimeElapsed('Data inválida');
                return;
            }

            const diff = new Date() - startDate;
            if (diff < 0) {
                setTimeElapsed('Data no futuro!');
                return;
            }

            const years = Math.floor(diff / 31556952000);
            const months = Math.floor((diff % 31556952000) / 2629746000);
            const days = Math.floor((diff % 2629746000) / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeElapsed(`${years}a, ${months}m, ${days}d, ${hours}h ${minutes}m ${seconds}s`);
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();
        return () => clearInterval(timer);
    }, [dataRelacao, horaRelacao, dataAmizade, activeTab]);

    // --- FUNÇÕES DE MANIPULAÇÃO DE EVENTOS ---

    const handleFileChange = (e) => {
        if (loading) return;
        const newFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
        const combined = [...fotos, ...newFiles].slice(0, 10);
        setFotos(combined);
        setFotosError(combined.length >= 10 ? 'Limite de 10 fotos atingido.' : '');
    };

    const handleRemovePhoto = (indexToRemove) => {
        setFotos(fotos.filter((_, index) => index !== indexToRemove));
        setFotosError('');
    };

    const nextStep = () => setCurrentStep(step => Math.min(step + 1, 4));
    const prevStep = () => setCurrentStep(step => Math.max(step - 1, 1));

    const handlePayment = async (e) => {
        e.preventDefault();
        if (fotos.length === 0) {
            setFotosError('Por favor, adicione pelo menos uma foto.');
            setCurrentStep(2);
            return;
        }
        setLoading(true);

        try {
            const imageUrls = await uploadImages(fotos);
            const formData = {
                mensagem,
                youtubeUrl,
                imageUrls,
                tipoRelacao: activeTab,
                ...(activeTab === 'amor'
                    ? { nomeCasal, dataRelacao: `${dataRelacao} ${horaRelacao}` }
                    : { nomeAmigo, dataAmizade }
                ),
            };

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!uploadResponse.ok) throw new Error('Erro ao enviar os dados.');

            const { timelineId } = await uploadResponse.json();
            if (!timelineId) throw new Error('Erro ao obter o ID da timeline.');

            setTimelineId(timelineId);
            setIsPaymentModalOpen(true);
        } catch (error) {
            console.error('Erro no processo de pagamento:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentMethodSelect = async (method) => {
        setLoading(true);
        try {
            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timelineId, paymentMethod: method }),
            });

            if (method === 'credit') {
                const { sessionId } = await response.json();
                const stripe = await stripePromise;
                await stripe.redirectToCheckout({ sessionId });
            } else if (method === 'pix') {
                router.push(`/pix_payment?timelineId=${timelineId}`);
            }
        } catch (error) {
            console.error('Erro ao processar método de pagamento:', error);
        } finally {
            setLoading(false);
            setIsPaymentModalOpen(false);
        }
    };

    const backgroundClass = activeTab === 'amor'
        ? 'bg-gradient-to-br from-pink-50 via-red-50 to-orange-100'
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-100';

    // --- RENDERIZAÇÃO DO COMPONENTE ---
    return (
        <div className={`min-h-screen w-full font-sans text-gray-800 transition-colors duration-700 ${backgroundClass}`}>

            <section className="flex flex-col items-center justify-center text-center min-h-screen px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">{generateHearts(activeTab === 'amor')}</div>
                <div className="z-10">
                    <motion.h1
                        className="text-2xl font-bold text-pink-800 font-dancing-script mb-4"
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    >
                        Surprise for Love
                    </motion.h1>
                    <motion.h2
                        className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-slate-600"
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Crie um presente <span className="font-dancing-script text-pink-600">inesquecível</span> e celebre sua história.
                    </motion.h2>
                    <motion.p
                        className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10"
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Transforme suas memórias em uma página web exclusiva com contador, fotos e música. A surpresa perfeita para quem você ama.
                    </motion.p>
                    <motion.button
                        onClick={() => creationFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transform transition-transform hover:scale-105"
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6, type: 'spring', stiffness: 120 }}
                    >
                        Começar a Criar Agora
                    </motion.button>
                </div>
            </section>

            <section className="py-20 px-4" ref={creationFormRef}>
                <div className="flex flex-col lg:flex-row lg:space-x-12 items-start justify-center max-w-7xl mx-auto">

                    <div className="w-full lg:w-1/2 max-w-2xl">
                        <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/50">
                            <StepProgressBar currentStep={currentStep} totalSteps={4} />
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                >
                                    <form onSubmit={handlePayment} noValidate>
                                        {currentStep === 1 && (
                                            <div>
                                                <h3 className="font-bold text-2xl mb-2 text-slate-800">Passo 1: O Coração da Surpresa</h3>
                                                <p className="text-gray-600 mb-6">Para quem é esta linda homenagem?</p>
                                                <div className="flex space-x-4 mb-6">
                                                    <button type="button" onClick={() => setActiveTab('amor')} className={`p-3 rounded-lg w-full font-semibold border-2 transition-all ${activeTab === 'amor' ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-white/50 border-transparent hover:bg-white'}`}>Para um Amor ❤️</button>
                                                    <button type="button" onClick={() => setActiveTab('amigo')} className={`p-3 rounded-lg w-full font-semibold border-2 transition-all ${activeTab === 'amigo' ? 'bg-blue-700 text-white border-blue-800 shadow-lg' : 'bg-white/50 border-transparent hover:bg-white'}`}>Para um Amigo(a) 💙</button>
                                                </div>
                                                <label htmlFor="mensagem" className="block text-md font-bold mb-2 text-slate-700">Mensagem Personalizada</label>
                                                <textarea id="mensagem" placeholder="Capriche na mensagem! Este é o momento de emocionar... 😎😘" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required rows="5" className="w-full p-3 border border-gray-300 rounded-md bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                <button type="button" onClick={nextStep} className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white p-3 rounded-lg mt-6 font-bold hover:shadow-xl transform hover:scale-105 transition-all">Próximo Passo</button>
                                            </div>
                                        )}
                                        {currentStep === 2 && (
                                            <div>
                                                <h3 className="font-bold text-2xl mb-2 text-slate-800">Passo 2: As Memórias Visuais</h3>
                                                <p className="text-gray-600 mb-6">Escolha as melhores fotos (até 10) e uma música especial.</p>
                                                <label className="block text-md font-bold mb-2 text-slate-700">Suas Fotos</label>
                                                <div className="mt-1 flex flex-col justify-center items-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition" onClick={() => document.getElementById('fotos-input').click()}>
                                                    <input type="file" id="fotos-input" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                                    <p className="text-gray-600 text-center p-4">Arraste e solte ou clique para selecionar</p>
                                                </div>
                                                {fotos.length > 0 && <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">{fotos.map((file, index) => (<div key={index} className="relative w-full aspect-square rounded-md overflow-hidden shadow-md"><img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-full object-cover" /><button type="button" onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold backdrop-blur-sm">X</button></div>))}</div>}
                                                {fotosError && <p className="text-red-500 text-sm mt-2 font-semibold">{fotosError}</p>}
                                                <label htmlFor="youtubeUrl" className="block text-md font-bold mt-6 mb-2 text-slate-700">Link da Música no YouTube (Opcional)</label>
                                                <input type="url" id="youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                <div className="flex justify-between mt-6"><button type="button" onClick={prevStep} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition">Voltar</button><button type="button" onClick={nextStep} className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-6 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all">Próximo Passo</button></div>
                                            </div>
                                        )}
                                        {currentStep === 3 && (
                                            <div>
                                                <h3 className="font-bold text-2xl mb-2 text-slate-800">Passo 3: Detalhes Finais</h3>
                                                <p className="text-gray-600 mb-6">Falta pouco! Preencha os nomes e a data do início de tudo.</p>
                                                {activeTab === 'amor' ? (
                                                    <>
                                                        <label htmlFor="nomeCasal" className="block text-md font-bold mb-2 text-slate-700">Nome do Casal</label>
                                                        <input type="text" id="nomeCasal" placeholder="Ex: Romeu e Julieta" value={nomeCasal} onChange={(e) => setNomeCasal(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md mb-4 bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                        <label htmlFor="dataRelacao" className="block text-md font-bold mb-2 text-slate-700">Data e Hora de Início</label>
                                                        <div className="flex space-x-2">
                                                            <input type="text" id="dataRelacao" placeholder="DD/MM/AAAA" value={dataRelacao} onChange={(e) => setDataRelacao(e.target.value)} required className="w-2/3 p-3 border border-gray-300 rounded-md bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                            <input type="text" id="horaRelacao" placeholder="HH:MM" value={horaRelacao} onChange={(e) => setHoraRelacao(e.target.value)} required className="w-1/3 p-3 border border-gray-300 rounded-md bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <label htmlFor="nomeAmigo" className="block text-md font-bold mb-2 text-slate-700">Nome do Amigo(a)</label>
                                                        <input type="text" id="nomeAmigo" placeholder="Ex: João e Maria" value={nomeAmigo} onChange={(e) => setNomeAmigo(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md mb-4 bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                        <label htmlFor="dataAmizade" className="block text-md font-bold mb-2 text-slate-700">Data de Início da Amizade</label>
                                                        <input type="text" id="dataAmizade" placeholder="DD/MM/AAAA" value={dataAmizade} onChange={(e) => setDataAmizade(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-md bg-white/70 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition" />
                                                    </>
                                                )}
                                                <div className="flex justify-between mt-6"><button type="button" onClick={prevStep} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition">Voltar</button><button type="button" onClick={nextStep} className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-3 px-6 rounded-lg font-bold hover:shadow-xl transform hover:scale-105 transition-all">Ver Prévia Final</button></div>
                                            </div>
                                        )}
                                        {currentStep === 4 && (
                                            <div>
                                                <h3 className="font-bold text-2xl mb-2 text-slate-800">Passo Final: Gerar sua Surpresa!</h3>
                                                <p className="text-gray-600 mb-6">Sua página está pronta! Finalize o pagamento para receber o link e o QR Code.</p>
                                                <div className="text-center bg-green-100/70 border border-green-400/50 text-green-900 p-4 rounded-lg mb-6 shadow-inner">
                                                    <p className="font-bold text-2xl">Valor único de R$ 21,90</p>
                                                    <p className="text-sm mt-1">Pagamento seguro e link gerado na hora.</p>
                                                </div>
                                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg font-bold text-xl hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {loading ? 'Processando...' : 'Pagar e Receber Minha Surpresa'}
                                                </button>
                                                <div className="flex justify-center mt-6"><button type="button" onClick={prevStep} className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition">Voltar e Editar</button></div>
                                            </div>
                                        )}
                                    </form>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex-1 mt-12 lg:mt-0 w-full max-w-md mx-auto lg:sticky lg:top-20">
                        <motion.div className="p-6 bg-gray-900/90 backdrop-blur-lg text-white rounded-3xl shadow-2xl border border-white/20" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <h3 className="text-center text-xl font-bold mb-4">Prévia em Tempo Real</h3>
                            <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden shadow-inner border-2 border-white/30 bg-gray-800 flex items-center justify-center">
                                {previewUrl ? (<img src={previewUrl} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out" />) : (<p className="text-center text-gray-400 px-4">Suas fotos aparecerão aqui!</p>)}
                                {showHearts && <div className="hearts-container">{generateHearts(activeTab === 'amor')}</div>}
                            </div>
                            <div className="text-center mt-4">
                                <p className="font-semibold text-2xl font-dancing-script">{activeTab === 'amor' ? `❤️ ${nomeCasal || 'Nome do Casal'} ❤️` : `💙 ${nomeAmigo || 'Nome do Amigo(a)'} 💙`}</p>
                                <p className="font-semibold mt-2 text-sm text-gray-300">{activeTab === 'amor' ? 'Estamos juntos há:' : 'Amizade para sempre, há:'}</p>
                                <p className="mt-1 text-gray-200 text-lg font-mono tracking-tighter">{timeElapsed}</p>
                            </div>
                            <hr className="my-4 border-gray-700" />
                            <div className="text-center text-gray-300 h-24 overflow-y-auto p-2 rounded-md bg-white/5">
                                <p className="italic" style={{ whiteSpace: 'pre-line' }}>{mensagem || 'Sua mensagem especial aparecerá aqui...'}</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="text-center mb-12 px-4">
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-slate-600">A reação deles não tem preço</h2>
                    <p className="text-lg text-slate-600 mt-4">Veja o que nossos clientes criaram e sentiram.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                    <motion.div className="shadow-2xl rounded-xl overflow-hidden transform transition-transform hover:scale-105" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}><div dangerouslySetInnerHTML={{ __html: `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DAZENNZPaVx/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="margin: 0; max-width: 100%;"></blockquote>` }} /></motion.div>
                    <motion.div className="shadow-2xl rounded-xl overflow-hidden transform transition-transform hover:scale-105" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}><div dangerouslySetInnerHTML={{ __html: `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DA8gohJOun8/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="margin: 0; max-width: 100%;"></blockquote>` }} /></motion.div>
                    <motion.div className="shadow-2xl rounded-xl overflow-hidden transform transition-transform hover:scale-105" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}><div dangerouslySetInnerHTML={{ __html: `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DCFfwq6O1Bm/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style="margin: 0; max-width: 100%;"></blockquote>` }} /></motion.div>
                </div>
                <script async src="//www.instagram.com/embed.js"></script>
            </section>

            <section className="py-20 bg-white/30">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-10 text-slate-800">Perguntas Frequentes</h2>
                    <div className="space-y-5">

                        {/* Pergunta 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="p-6 bg-white/80 rounded-lg shadow-lg"
                        >
                            <p className="font-bold text-lg text-slate-900">O que é a Surprise for Love?</p>
                            <p className="mt-2 text-gray-700">É uma plataforma para criar páginas personalizadas e emocionantes para casais e amigos, com contador de tempo, fotos, música e uma mensagem especial.</p>
                        </motion.div>

                        {/* Pergunta 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="p-6 bg-white/80 rounded-lg shadow-lg"
                        >
                            <p className="font-bold text-lg text-slate-900">Qual o valor?</p>
                            <p className="mt-2 text-gray-700">O valor é de apenas R$ 21,90. O pagamento é único e você recebe o acesso à sua página imediatamente após a confirmação.</p>
                        </motion.div>

                        {/* Pergunta 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="p-6 bg-white/80 rounded-lg shadow-lg"
                        >
                            <p className="font-bold text-lg text-slate-900">Como recebo minha página?</p>
                            <p className="mt-2 text-gray-700">Após a confirmação do pagamento, você receberá um link exclusivo e um QR Code para compartilhar e fazer a surpresa quando e como quiser.</p>
                        </motion.div>

                        {/* Pergunta 4 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="p-6 bg-white/80 rounded-lg shadow-lg"
                        >
                            <p className="font-bold text-lg text-slate-900">O site fica no ar por quanto tempo?</p>
                            <p className="mt-2 text-gray-700">Sua página personalizada ficará no ar por tempo indeterminado, para que você possa reviver essas memórias sempre que desejar!</p>
                        </motion.div>

                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-center items-center space-x-8 mb-8">
                        <a href="mailto:forlovesurprise@gmail.com" className="text-gray-400 hover:text-pink-400 transition-colors" aria-label="Email">
                            <FaEnvelope size={28} />
                        </a>
                        <a href="https://wa.me/5531996893519" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors" aria-label="WhatsApp">
                            <FaWhatsapp size={28} />
                        </a>
                        <a href="https://www.instagram.com/surpriseforlove_ofi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors" aria-label="Instagram">
                            <FaInstagram size={28} />
                        </a>
                    </div>
                    <div className="text-center text-gray-500">
                        <p>© {new Date().getFullYear()} SurpriseForLove. Todos os direitos reservados.</p>
                        <p className="text-sm mt-2">Criando momentos inesquecíveis.</p>
                    </div>
                </div>
            </footer>

            {/* Modais com fundo blur */}
            <AnimatePresence>
                {loading && !isPaymentModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Modal isVisible={true} message="Aguarde, estamos criando sua página personalizada ❤️" />
                    </motion.div>
                )}
                {isPaymentModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <PaymentModal
                            isVisible={true}
                            onClose={() => setIsPaymentModalOpen(false)}
                            onSelectPaymentMethod={handlePaymentMethodSelect}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Iframe para tocar música do YouTube em background */}
            {youtubeUrl && getYoutubeVideoId(youtubeUrl) && (
                <iframe
                    width="0"
                    height="0"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}?autoplay=1&loop=1&playlist=${getYoutubeVideoId(youtubeUrl)}&controls=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ display: 'none' }}
                ></iframe>
            )}
        </div>
    );
}