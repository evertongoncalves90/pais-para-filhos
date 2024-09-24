import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link
                        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
                        rel="stylesheet"
                        crossOrigin="anonymous" // Corrigido para usar crossOrigin em camelCase
                    />

                    <link rel="icon" href="/favicon.ico" /> {/* Substitua /favicon.ico pelo caminho correto do seu favicon */}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
