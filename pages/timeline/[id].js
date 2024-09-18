import mongoose from 'mongoose';
import Timeline from '../../models/Timeline'; // Importar o modelo corretamente
import Image from 'next/image';

export async function getServerSideProps(context) {
    const { id } = context.params;

    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Buscar a timeline no MongoDB
    const timeline = await Timeline.findById(id).lean();

    return {
        props: {
            timeline: JSON.parse(JSON.stringify(timeline)),
        },
    };
}

export default function TimelinePage({ timeline }) {
    const { nomeFilhos, dataNascimento, mensagem, imageUrls } = timeline;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-3xl font-bold mb-4">Timeline de {nomeFilhos}</h1>
            <p>Data de Nascimento: {new Date(dataNascimento).toLocaleDateString()}</p>
            <p className="text-lg mb-6">{mensagem}</p>

            <div className="slideshow">
                {imageUrls.map((url, index) => (
                    <div key={index} className="mb-4">
                        <Image src={url} alt={`Imagem ${index + 1}`} width={500} height={500} />
                    </div>
                ))}
            </div>
        </div>
    );
}
