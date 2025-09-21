import Head from 'next/head';
import { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>V2SL - Sign Language Learning</title>
                <meta name="description" content="Learn sign language through interactive video lessons" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E👋%3C/text%3E%3C/svg%3E" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
