import Image from 'next/image';

interface CallCenterBrandProps {
  className?: string;
}

export default function CallCenterBrand({ className }: CallCenterBrandProps) {
  const rootClassName = ['flex items-center gap-4', className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <Image
        src="/pizza-hut-symbol-official.png"
        alt="Logo de Pizza Hut"
        width={88}
        height={88}
        priority
        className="h-[68px] w-[68px] shrink-0 object-contain md:h-[82px] md:w-[82px]"
      />

      <div className="flex flex-col">
        <span className="text-[0.68rem] font-black uppercase tracking-[0.34em] text-red-600 md:text-[0.72rem]">
          Pizza Hut
        </span>
        <span className="text-[1.62rem] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[#1b243d] md:text-[2.35rem]">
          Monitoreo Call
        </span>
        <span className="text-[1.62rem] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[#1b243d] md:text-[2.35rem]">
          Center
        </span>
      </div>
    </div>
  );
}
