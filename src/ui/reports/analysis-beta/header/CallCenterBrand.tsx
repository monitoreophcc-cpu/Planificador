import Image from 'next/image';

interface CallCenterBrandProps {
  className?: string;
}

export default function CallCenterBrand({ className }: CallCenterBrandProps) {
  const rootClassName = ['flex items-center gap-3', className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <Image
        src="/call-center-brand-logo.png"
        alt="Logo de Pizza Hut"
        width={84}
        height={84}
        priority
        className="h-[68px] w-[68px] shrink-0 object-contain drop-shadow-[0_14px_24px_rgba(239,68,68,0.22)] md:h-[84px] md:w-[84px]"
      />

      <div className="flex flex-col uppercase leading-[0.88] text-[#1b243d]">
        <span className="text-[1.7rem] font-black tracking-[-0.08em] md:text-[2.5rem]">
          Monitoreo Call
        </span>
        <span className="text-[1.7rem] font-black tracking-[-0.08em] md:text-[2.5rem]">
          Center
        </span>
      </div>
    </div>
  );
}
