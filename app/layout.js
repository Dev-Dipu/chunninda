import localFont from "next/font/local";
import { Cinzel, Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const kannada = localFont({
  src: "../public/fonts/kannada.ttf",
  variable: "--font-kannada",
  display: "swap",
});

const helvetica = localFont({
  src: "../public/fonts/helvtica.otf",
  variable: "--font-helvetica",
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://chunniindia.com"),
  title: "CHUNNIINDIA — Launching Soon | Luxury Indian Couture",
  description:
    "CHUNNIINDIA is getting ready to make its debut. Sign up to be the first to know about our launch, new updates, and exclusive heritage collections.",
  keywords: ["CHUNNIINDIA", "luxury chunni", "Indian couture", "heritage dupatta", "launching soon"],
  openGraph: {
    title: "CHUNNIINDIA — Launching Soon",
    description: "Handcrafted Indian Couture & Heritage Drapes. Join the priority circle.",
    images: [{ url: "/images/img1.jpeg" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${kannada.variable} ${helvetica.variable} ${cinzel.variable} ${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#120f0d] text-[#f4ece1] selection:bg-[#b3653b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
