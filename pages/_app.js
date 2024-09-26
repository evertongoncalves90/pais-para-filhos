// pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                {/* Importando a fonte Poppins */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <Component {...pageProps} />
            <Analytics />
        </>
    );
}

export default MyApp;
