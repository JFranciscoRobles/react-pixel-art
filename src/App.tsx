import { useRef } from "react";
import { Toolbar } from "./components/tool-bar";
import { ColorPicker } from "./components/color-picker";
import { BrushSize } from "./components/brush-size";
import { Layers } from "./components/layers";
import { Settings } from "./components/settings";
import { ExportButton } from "./components/export-button";
import { Canvas } from "./components/canvas";
import Zoom from "./components/zoom";
import { UndoRedo } from "./components/undo-redo";
import { Github } from "lucide-react";

export default function PixelArtCreator() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-screen p-2">
      <header className="p-4 text-center border-b">
        <h1 className="text-3xl font-bold">Pixel Art</h1>
      </header>

      <div className="flex flex-1">
        <aside className="flex flex-col p-4 overflow-y-auto border-r w-fit">
          <h2 className="mb-4 text-lg font-bold">Herramientas</h2>
          <Toolbar />
          <h3 className="mt-6 mb-2 font-semibold">Picel</h3>
          <ColorPicker />
          <BrushSize />
          <h3 className="mt-6 mb-2 font-semibold">Configuración</h3>
          <Settings />
          <div className="mt-6 mb-2">
            <ExportButton />
          </div>
        </aside>

        <main className="flex flex-col w-full">
          <div className="relative border-b">
            <Canvas containerRef={containerRef} />
          </div>

          <div className="flex justify-between w-full p-4 border-t">
            <Zoom containerRef={containerRef} />
            <UndoRedo />
          </div>
        </main>

        <aside className="p-4 border-l w-fit">
          <h2 className="mb-4 text-lg font-bold">Capas</h2>
          <Layers />
        </aside>
      </div>

      <footer className="p-4 mt-8 text-center border-t rounded-xl bg-primary text-primary-foreground">
        <a
          href="https://github.com/tu-repositorio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 "
        >
          <Github size={24} /> Repositorio en GitHub
        </a>
        <p className="p-6 mt-2 text-center">
          Esta es una aplicación web para crear arte en píxeles. Su interfaz
          intuitiva permite a los usuarios dibujar, borrar y rellenar celdas en
          una cuadrícula con varios tamaños de pincel y capas. Es perfecta para
          diseñadores, artistas y entusiastas del pixel art que buscan una forma
          rápida y sencilla de dar vida a sus ideas.
        </p>
      </footer>
    </div>
  );
}
