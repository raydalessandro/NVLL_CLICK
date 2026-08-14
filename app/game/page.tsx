import { NvllWorldGame } from "@/components/nvll-world/NvllWorldGame";

export const metadata = {
  // Il layout radice aggiunge già "— NVLL CLICK" dal template.
  title: "WORLD 00",
  description: "Esplora Monzoro, entra in NVLL SUPPLY e ascolta NVLL CLICK.",
};

export default function GamePage() {
  return <NvllWorldGame />;
}
