import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
    const [nomeFilhos, setNomeFilhos] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [fotos, setFotos] = useState([]);
    const [youtubeUrl, setYoutubeUrl] = useState(''); // Novo estado para a URL do YouTube
    const [qrCode, setQrCode] = useState(null);
    const [timelineUrl, setTimelineUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        for (let i = 0; i < fotos.length; i++) {
            formData.append('fotos', fotos[i]);
        }

        formData.append('nomeFilhos', nomeFilhos);
        formData.append('dataNascimento', dataNascimento);
        formData.append('mensagem', mensagem);
        formData.append('youtubeUrl', youtubeUrl); // Adicionar a URL do YouTube ao FormData

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <header className="text-center">
                <h1 className="text-4xl font-bold mb-4">De pais para filhos</h1>
                <p className="text-lg">
                    Surpreenda seus filhos! Crie um contador dinâmico de tempo de paternidade. Preencha o formulário e receba o seu site personalizado + QR Code para compartilhar as melhores lembranças com sua família 🙂
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-8 w-full max-w-lg bg-white p-8 rounded-lg shadow">
                <div className="mb-4">
                    <label htmlFor="nomeFilhos" className="block text-sm font-medium">
                        Nome dos filhos
                    </label>
                    <input
                        type="text"
                        id="nomeFilhos"
                        value={nomeFilhos}
                        onChange={(e) => setNomeFilhos(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="dataNascimento" className="block text-sm font-medium">
                        Data de Nascimento
                    </label>
                    <input
                        type="date"
                        id="dataNascimento"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="mensagem" className="block text-sm font-medium">
                        Mensagem Personalizada
                    </label>
                    <textarea
                        id="mensagem"
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        required
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="fotos" className="block text-sm font-medium">
                        Selecione até 10 fotos
                    </label>
                    <input
                        type="file"
                        id="fotos"
                        multiple
                        accept="image/*"
                        onChange={(e) => setFotos(e.target.files)}
                        className="mt-1 block w-full p-2"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="youtubeUrl" className="block text-sm font-medium">
                        Link do YouTube (opcional)
                    </label>
                    <input
                        type="url"
                        id="youtubeUrl"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg">
                    Criar minha Timeline
                </button>
            </form>

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
