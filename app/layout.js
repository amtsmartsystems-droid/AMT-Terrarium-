import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "AMT Smart Terrarium",
  description: "Your intelligent terrarium companion powered by AMT Smart Systems",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "Cairo, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
