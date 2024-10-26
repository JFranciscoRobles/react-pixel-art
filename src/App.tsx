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
  const canvaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-screen p-2">
      <header className="p-4 text-center border-b">
        <h1 className="text-3xl font-bold">Pixel Art</h1>
      </header>

      <div className="flex flex-col flex-1 lg:flex-row">
        <aside className="flex flex-col p-4 overflow-y-auto border-r lg:w-1/4">
          <h2 className="mb-4 text-lg font-bold">Herramientas</h2>
          <Toolbar />
          <h3 className="mt-6 mb-2 font-semibold">Pixel</h3>
          <ColorPicker />
          <BrushSize />
          <h3 className="mt-6 mb-2 font-semibold">Configuración</h3>
          <Settings />
          <div className="mt-6 mb-2">
            <ExportButton />
          </div>
        </aside>

        <main className="flex flex-col flex-1 overflow-hidden">
          <div
            className="relative flex-1 overflow-auto"
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <Canvas containerRef={containerRef} canvaRef={canvaRef} />
          </div>

          <div className="flex justify-between w-full p-4 border-t">
            <Zoom containerRef={containerRef} canvaRef={canvaRef} />
            <UndoRedo />
          </div>
        </main>

        <aside className="flex-none p-4 border-l lg:w-1/4">
          <h2 className="mb-4 text-lg font-bold">Capas</h2>
          <Layers />
        </aside>
      </div>

      <footer className="p-4 mt-8 text-center border-t rounded-xl bg-primary text-primary-foreground">
        <a
          href="https://github.com/JFranciscoRobles/react-pixel-art"
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
