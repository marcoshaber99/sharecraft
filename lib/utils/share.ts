import { toast } from "@/hooks/use-toast";

interface ShareImageOptions {
  canvas: HTMLCanvasElement;
  fileName: string;
}

export async function shareImage({ canvas, fileName }: ShareImageOptions) {
  try {
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), "image/png")
    );

    // Try native sharing first
    if (
      navigator.share &&
      navigator.canShare({ files: [new File([blob], fileName)] })
    ) {
      try {
        await navigator.share({
          files: [new File([blob], fileName, { type: "image/png" })],
        });
        return;
      } catch (err) {
        if (!(err instanceof Error) || err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Try clipboard
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast({
        description: "Copied to clipboard",
        duration: 2000,
      });
      return;
    } catch (err) {
      console.error("Clipboard failed:", err);
    }

    // Fallback to download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      description: "Image downloaded",
      duration: 2000,
    });
  } catch (err) {
    console.error("Failed to export image:", err);
    toast({
      variant: "destructive",
      description: "Failed to export image",
      duration: 3000,
    });
  }
}
