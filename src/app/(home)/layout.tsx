import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./home.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.7' stroke-linecap='round'%3E%3Cpath d='M12 3.5 4.6 8v8L12 20.5 19.4 16V8L12 3.5Z' stroke-linejoin='round'/%3E%3Cpath d='M12 3.5V12m0 0-7.4 4M12 12l7.4 4'/%3E%3Ccircle cx='12' cy='12' r='2.1' fill='white' stroke='none'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "NeuralForge — AI Software Agency",
  description:
    "NeuralForge designs and ships AI agents, automations and assistants that do real work for your team.",
  icons: { icon: favicon },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body style={{ background: "#000", color: "#fff" }}>{children}</body>
    </html>
  );
}
