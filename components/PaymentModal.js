import Modal from 'react-modal';

Modal.setAppElement('#__next'); // Defina o elemento principal da sua aplicação

const PaymentModal = ({ isVisible, onClose, onSelectPaymentMethod }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-xl font-bold mb-4">Escolha a Forma de Pagamento</h2>
                <button
                    onClick={() => onSelectPaymentMethod('credit')}
                    className="w-full bg-blue-500 text-white p-3 rounded-lg mb-4"
                >
                    Cartão de Crédito
                </button>
                <button
                    onClick={() => onSelectPaymentMethod('pix')}
                    className="w-full bg-green-500 text-white p-3 rounded-lg"
                >
                    PIX
                </button>
                <button
                    onClick={onClose}
                    className="w-full text-red-500 mt-4"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;

