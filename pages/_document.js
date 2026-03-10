import {Html, Head, Main, NextScript} from "next/document";

const SITE_URL = "https://tgpm.world";
const TITLE = "TempoGeoPoliticalMap — World Political Events from Wikipedia";
const DESCRIPTION = "An open-source project that reduces informational bias by presenting unfiltered geopolitical events of interest directly from Wikipedia.";
const OG_IMAGE = `${SITE_URL}/images/header-hero.png`;

function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />

        {/* Primary */}
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#7f0000" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="TempoGeoPoliticalMap" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Page title */}
        <title>{TITLE}</title>
      </Head>
      <body className="font-inter antialiased bg-gray-900 text-gray-200 tracking-tight">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
