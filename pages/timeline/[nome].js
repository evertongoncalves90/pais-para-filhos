import { useRouter } from 'next/router';

export default function Timeline() {
    const router = useRouter();
    const { nome } = router.query;

    // Aqui você pode buscar as fotos e dados do banco de dados com base no nome do filho
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">Timeline de {nome}</h1>
            <div>
                {/* Lógica para exibir o vídeo gerado e o contador */}
            </div>
        </div>
    );
}
