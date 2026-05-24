export interface ImageOverlayProps {
  variant: keyof typeof overlayVariants;
}

interface OverlayShape {
  id: string;
  styles: string;
}

export const overlayVariants: Record<string, OverlayShape[]> = {
  yellow: [
    {
      id: 'yellow-shape-1',
      styles:
        'absolute top-[-6%] left-[40%] h-[80%] w-[50%] rounded-2xl border border-black bg-[var(--overlay-yellow)] z-[-1]',
    },
    {
      id: 'yellow-shape-2',
      styles:
        'absolute top-[10%] right-[-8%] h-[80%] w-[30%] rounded-2xl border border-black bg-[var(--overlay-yellow)] z-[-1]',
    },
  ],
  blue: [
    {
      id: 'blue-shape-1',
      styles:
        'absolute top-[-12%] left-[-4%] h-[117%] w-[90%] rounded-2xl border border-black bg-[var(--overlay-blue)] z-[-1]',
    },
    {
      id: 'blue-shape-2',
      styles:
        'absolute top-[25%] left-[5%] h-[80%] w-[100%] rounded-tr-2xl rounded-br-2xl border-t border-r border-b border-black bg-[var(--overlay-blue)] z-[-1]',
    },
  ],
  green: [
    {
      id: 'green-shape-1',
      styles:
        'absolute top-[-10%] left-[0%] h-[115%] w-[85%] rounded-2xl border border-black bg-[var(--overlay-green)] z-[-1]',
    },
    {
      id: 'green-shape-2',
      styles:
        'absolute top-[20%] left-[10%] h-[75%] w-[95%] rounded-tr-2xl rounded-br-2xl border-t border-r border-b border-black bg-[var(--overlay-green)] z-[-1]',
    },
  ],
};

export default function ImageOverlay({ variant }: ImageOverlayProps) {
  return (
    <>
      {overlayVariants[variant].map((item) => (
        <div key={item.id} className={item.styles} aria-hidden="true" />
      ))}
    </>
  );
}
