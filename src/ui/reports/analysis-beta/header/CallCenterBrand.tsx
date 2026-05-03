import Image from 'next/image';

interface CallCenterBrandProps {
  className?: string;
}

export default function CallCenterBrand({ className }: CallCenterBrandProps) {
  const rootClassName = ['flex items-center gap-4', className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/Analisis_de_llamadas_logo.svg"
          alt="Logo de análisis de llamadas"
          width={76}
          height={64}
          className="h-14 w-auto object-contain md:h-16"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[1.45rem] font-black leading-[0.95] tracking-[-0.06em] text-[#1b243d] md:text-[2.1rem]">
          Call Center
        </span>
      </div>
    </div>
  );
}
