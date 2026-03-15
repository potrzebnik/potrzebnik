export interface ImageOverlayProps {
  variant: keyof typeof overlayVariants;
}

export const overlayVariants = {
  yellow: [
    'absolute top-[-6%] left-[40%] h-[80%] w-[50%] rounded-2xl border border-black bg-[#F6D94F] z-[-1]',
    'absolute top-[10%] right-[-8%] h-[80%] w-[30%] rounded-2xl border border-black bg-[#F6D94F] z-[-1]',
  ],
  blue: [
    'absolute top-[-12%] left-[-4%] h-[117%] w-[90%] rounded-2xl border border-black bg-[#B6D0F2] z-[-1]',
    'absolute top-[25%] left-[5%] h-[80%] w-[100%] rounded-tr-2xl rounded-br-2xl border-t border-r border-b border-black bg-[#B6D0F2] z-[-1]',
  ],
  green: [
    'absolute top-[-10%] left-[0%] h-[115%] w-[85%] rounded-2xl border border-black bg-[#C8E6C9] z-[-1]',
    'absolute top-[20%] left-[10%] h-[75%] w-[95%] rounded-tr-2xl rounded-br-2xl border-t border-r border-b border-black bg-[#C8E6C9] z-[-1]',
  ],
} as const;

export default function ImageOverlay({ variant }: ImageOverlayProps) {
  return (
    <>
      {overlayVariants[variant].map((styles, index) => (
        <div key={index} className={styles} />
      ))}
    </>
  );
}
