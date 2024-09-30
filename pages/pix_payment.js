import { useRouter } from 'next/router';
import { useState } from 'react';

const PixPayment = () => {
    const router = useRouter();
    const { timelineId } = router.query; // Recebe o timelineId da URL
    const [copied, setCopied] = useState(false); // Estado para controlar o feedback de cópia
    const pixKey = '00020101021126580014br.gov.bcb.pix013663b8cf57-17af-4b31-9971-7aaa007fd123520400005303986540521.905802BR5925EVERTON GONCALVES ROMUALD6009SAO PAULO622905251J91M0EPQNG23M5157R7WDR2T63049DA4'; // Chave PIX que será copiada

    // Função para copiar a chave PIX
    const handleCopyPixKey = () => {
        navigator.clipboard.writeText(pixKey).then(() => {
            setCopied(true); // Atualiza o estado para indicar que a cópia foi bem-sucedida
            setTimeout(() => setCopied(false), 3000); // Remove a indicação após 3 segundos
        });
    };

    const whatsappLink = `https://wa.me/5531996893519?text=Olá, estou enviando o comprovante do pagamento PIX para a página com o ID: ${timelineId}`;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-full">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">Pagamento via PIX</h2>
                <p className="mb-4">
                    Utilize o QR Code abaixo para efetuar o pagamento via PIX.
                </p>
                <img src="/qrCode.png" alt="QR Code do PIX" className="w-64 h-64 mb-4 mx-auto" />

                <button
                    onClick={handleCopyPixKey}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
                >
                    {copied ? 'Chave PIX copiada!' : 'Copiar a chave PIX'}
                </button>

                <p className="mb-4">Após realizar o pagamento, envie o comprovante clicando no link abaixo:</p>
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                    Enviar comprovante via WhatsApp
                </a>
            </div>
        </div>
    );
};

export default PixPayment;
