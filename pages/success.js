import QRCode from 'react-qr-code'; // Usando react-qr-code
import Modal from 'react-modal'; // Modal para enviar o email
import mongoose from 'mongoose'; // Importar Mongoose
import Timeline from '../models/Timeline'; // Importar o modelo Timeline
import { FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa'; // Importar ícones do WhatsApp e Instagram

// Definir o elemento do app para o Modal (para evitar problemas com SSR)
Modal.setAppElement('#__next');
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Default para localhost caso esteja em ambiente de desenvolvimento

const SuccessPage = ({ timelineUrl }) => {
    // Função para copiar o link da timeline
    const copyLink = () => {
        navigator.clipboard.writeText(timelineUrl);
        alert("Link copiado!");
    };

    // Função para baixar o QRCode como imagem
    const downloadQRCode = () => {
        const svg = document.getElementById("qrcode");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngFile;
            downloadLink.download = "qrcode.png";
            downloadLink.click();
        };
    };

    // Função para compartilhar no WhatsApp
    const shareWhatsApp = () => {
        const url = `https://wa.me/?text=Veja%20minha%20timeline:%20${encodeURIComponent(timelineUrl)}`;
        window.open(url, "_blank");
    };

    // Função para compartilhar no Instagram (Direct)
    const shareInstagramDirect = () => {
        const url = `https://www.instagram.com/direct/new/?text=Veja%20minha%20timeline:%20${encodeURIComponent(timelineUrl)}`;
        window.open(url, "_blank");
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 items-center justify-center">Pagamento confirmado!</h1>
            <p className="text-lg mb-6 items-center justify-center">Aqui está o QRCode da sua página personalizada! Escaneie e veja como ficou:</p>

            <div className="mb-6">
                {/* Renderizando o QRCode usando react-qr-code */}
                <QRCode id="qrcode" value={timelineUrl} size={200} />
            </div>

            {/* Botões para salvar QRCode e link */}
            <button
                onClick={downloadQRCode}
                className="bg-green-500 text-white p-2 rounded-lg mb-4"
            >
                Clique para Baixar seu QRCode
            </button>
            <button
                onClick={copyLink}
                className="bg-blue-500 text-white p-2 rounded-lg mb-4"
            >
                Copie o link da sua página
            </button>
            <a href={timelineUrl} className="text-blue-500 underline mb-6 items-center justify-center" target="_blank" rel="noopener noreferrer">{timelineUrl}</a>

            {/* Compartilhar no WhatsApp e Instagram com ícones */}
            <div className="flex space-x-4">
                <button
                    onClick={shareWhatsApp}
                    className="bg-whatsapp text-green p-3 rounded-full"
                    aria-label="Compartilhar no WhatsApp"
                >
                    <FaWhatsapp size={24} />
                </button>
                <button
                    onClick={shareInstagramDirect}
                    className="bg-instagram text-blue p-3 rounded-full"
                    aria-label="Compartilhar no Instagram"
                >
                    <FaInstagram size={24} />
                </button>
            </div>
            {/* Seção de DICAS */}
            <div className="bg-white rounded-lg p-6 shadow-lg text-center max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Agora chegou a melhor hora! Prepare a sua surpresa! 🎁
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                    Vai aqui algumas dicas de como você pode surpreender aquela pessoa amada!
                </p>

                <ul className="text-left text-gray-700 space-y-4">
                    <li className="flex items-center space-x-2">
                        <span>❤️</span>
                        <span>Imprima o QRCode e entregue o QRCode impresso com um recadinho escrito a mão.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                        <span>🖼️</span>
                        <span>Imprima o QRCode e coloque-o junto de uma foto do casal em um porta-retratos.</span>
                    </li>
                    <li className="flex items-center space-x-2">
                        <span>😍</span>
                        <span>Imprima o QRCode e coloque-o junto de um colarzinho!</span>
                    </li>
                    <li className="flex items-center space-x-2">
                        <span>📸</span>
                        <span>Compartilhe no stories do Instagram apenas o QRCode e marque a pessoa amada!</span>
                    </li>
                </ul>
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
                        href="https://www.instagram.com/surpriseforlove" // Substitua pelo seu perfil do Instagram
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
};

export async function getServerSideProps(context) {
    const { timelineId } = context.query;  // Agora o timelineId será um ObjectId válido

    // Conectar ao MongoDB e buscar a timeline
    await mongoose.connect(process.env.MONGODB_URI);

    // Buscar a timeline usando o ObjectId gerado pelo MongoDB
    const timeline = await Timeline.findById(timelineId).lean();

    if (!timeline) {
        return {
            notFound: true,
        };
    }

    // Gerar a URL completa da timeline
    const timelineUrl = `${baseUrl}/timeline/${timelineId}`;

    return {
        props: { timelineUrl },
    };
}

export default SuccessPage;