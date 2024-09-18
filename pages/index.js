import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
    const [nomeFilhos, setNomeFilhos] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [fotos, setFotos] = useState([]); // Aqui está a declaração do estado das fotos
    const [qrCode, setQrCode] = useState(null); // Estado para armazenar o QR Code
    const [timelineUrl, setTimelineUrl] = useState(null); // Estado para armazenar a URL da timeline

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        for (let i = 0; i < fotos.length; i++) {
            formData.append('fotos', fotos[i]);
        }

        formData.append('nomeFilhos', nomeFilhos);
        formData.append('dataNascimento', dataNascimento);
        formData.append('mensagem', mensagem);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const { qrCode, timelineUrl } = await res.json(); // Recebe o QR Code e a URL
                setQrCode(qrCode); // Armazena o QR Code no estado
                setTimelineUrl(timelineUrl); // Armazena a URL da timeline no estado
            } else {
                console.error('Erro ao enviar as imagens:', res.statusText);
            }
        } catch (error) {
            console.error('Erro ao fazer o upload:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center justify-center">
            <header className="text-center mb-10">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">De pais para filhos</h1>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    Surpreenda seus filhos! Crie um contador dinâmico de tempo de paternidade. Preencha o formulário e receba o seu site personalizado
                    + QR Code para compartilhar as melhores lembranças com sua família 😊
                </p>
            </header>

            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-6">
                    <label htmlFor="nomeFilhos" className="block text-sm font-medium text-gray-700">Nome dos filhos</label>
                    <input
                        type="text"
                        id="nomeFilhos"
                        value={nomeFilhos}
                        onChange={(e) => setNomeFilhos(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <input
                        type="date"
                        id="dataNascimento"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700">Mensagem Personalizada</label>
                    <textarea
                        id="mensagem"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="fotos" className="block text-sm font-medium text-gray-700">Selecione até 10 fotos</label>
                    <input
                        type="file"
                        id="fotos"
                        multiple
                        accept="image/*"
                        onChange={(e) => setFotos(e.target.files)} // Certifique-se de que os arquivos estão sendo capturados
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out">
                    Criar minha Timeline
                </button>
            </form>

            {/* Exibir o QR Code e o link da timeline se estiver disponível */}
            {qrCode && (
                <div className="mt-8 text-center">
                    <h2 className="text-2xl font-bold">QR Code Gerado:</h2>
                    <Image src={qrCode} alt="QR Code" width={200} height={200} className="mt-4" />
                    <p className="mt-4">
                        <a href={timelineUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            Ver Timeline
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}
