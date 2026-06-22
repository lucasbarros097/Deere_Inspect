import { InspectionPhoto } from "@/types/inspection";
import { Camera, Trash2, Image as ImageIcon, Download } from "lucide-react";
import { useCallback, useRef } from "react";
import { toast } from "sonner";

interface PhotosSectionProps {
  fotos: InspectionPhoto[];
  onChange: (fotos: InspectionPhoto[]) => void;
  isFinalized?: boolean;
}

const MAX_PHOTOS = 10;

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = 1024;
        const scaleSize = maxWidth / img.width;
        let width = img.width;
        let height = img.height;

        if (scaleSize < 1) {
          width = maxWidth;
          height = img.height * scaleSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          resolve(img.src);
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const readOriginal = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

export function PhotosSection({ fotos, onChange, isFinalized }: PhotosSectionProps) {
  const originaisRef = useRef<Record<string, string>>({});

  const handlePhotoUpload = useCallback(
    async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Verifica limite
      const fotosPreenchidas = fotos.filter((f) => f.url).length;
      if (fotosPreenchidas >= MAX_PHOTOS) {
        toast.error(`Limite de ${MAX_PHOTOS} fotos atingido`);
        return;
      }

      try {
        const original = await readOriginal(file);
        const compressedBase64 = await compressImage(file);
        const novasFotos = [...fotos];
        originaisRef.current[novasFotos[index].id] = original;
        novasFotos[index] = {
          ...novasFotos[index],
          url: compressedBase64,
        };
        onChange(novasFotos);
      } catch (error) {
        toast.error("Erro ao processar imagem");
      }
    },
    [fotos, onChange]
  );

  const handleObservationChange = useCallback(
    (index: number, value: string) => {
      const novasFotos = [...fotos];
      novasFotos[index] = {
        ...novasFotos[index],
        observacao: value,
      };
      onChange(novasFotos);
    },
    [fotos, onChange]
  );

  const removePhoto = useCallback(
    (index: number) => {
      const novasFotos = [...fotos];
      delete originaisRef.current[novasFotos[index].id];
      novasFotos[index] = {
        ...novasFotos[index],
        url: "",
      };
      onChange(novasFotos);
    },
    [fotos, onChange]
  );

  const downloadPhoto = useCallback((foto: InspectionPhoto) => {
    const original = originaisRef.current[foto.id];
    const dataUrl = original || foto.url;
    if (!dataUrl) return;
    const mimeMatch = dataUrl.match(/^data:(image\/[^;]+);/);
    const mime = mimeMatch?.[1] || "image/jpeg";
    const ext = mime.split("/")[1] || "jpg";
    const safeTitle = (foto.titulo || "foto").replace(/[^\w-]+/g, "_");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${safeTitle}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const fotosPreenchidas = fotos.filter((f) => f.url).length;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-industrial-dark">
            Registro Fotográfico
          </h2>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-semibold">
            {fotosPreenchidas}/{MAX_PHOTOS}
          </div>
        </div>
        <p className="text-sm text-industrial-dark-foreground/70">
          Adicione até {MAX_PHOTOS} fotos das evidências e faça uma anotação sobre cada uma.
        </p>
        {fotosPreenchidas >= MAX_PHOTOS && (
          <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-xs font-medium text-destructive">
              ⚠️ Limite de fotos atingido
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fotos.map((foto, index) => (
          <div
            key={foto.id}
            className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col"
          >
            <div className="bg-muted px-4 py-2 flex justify-between items-center border-b border-border">
              <span className="font-semibold text-sm text-foreground">
                {foto.titulo}
              </span>
              {foto.url && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadPhoto(foto)}
                    className="text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors"
                    title="Baixar foto original"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {!isFinalized && (
                    <button
                      onClick={() => removePhoto(index)}
                      className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                      title="Remover Foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {!foto.url ? (
                <div className="h-48 bg-muted/30 flex border-b border-border">
                  {!isFinalized && fotosPreenchidas < MAX_PHOTOS ? (
                    <>
                      <label className="relative flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors border-r border-border">
                        <Camera className="h-7 w-7 text-industrial-dark-foreground/40 mb-1" />
                        <p className="text-xs font-medium text-industrial-dark-foreground/60">
                          Tirar Foto
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handlePhotoUpload(index, e)}
                        />
                      </label>
                      <label className="relative flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <ImageIcon className="h-7 w-7 text-industrial-dark-foreground/40 mb-1" />
                        <p className="text-xs font-medium text-industrial-dark-foreground/60">
                          Galeria
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handlePhotoUpload(index, e)}
                        />
                      </label>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground text-center px-2">
                        {isFinalized
                          ? "Inspeção finalizada - fotos não podem ser alteradas"
                          : "Limite de fotos atingido"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-48 border-b border-border bg-black">
                  <img
                    src={foto.url}
                    alt={foto.titulo}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="p-3 bg-card">
                <textarea
                  className="w-full p-2 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  rows={2}
                  placeholder="Adicionar observação..."
                  value={foto.observacao}
                  onChange={(e) => handleObservationChange(index, e.target.value)}
                  disabled={isFinalized}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}