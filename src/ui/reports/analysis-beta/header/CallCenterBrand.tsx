interface CallCenterBrandProps {
  className?: string;
}

export default function CallCenterBrand({ className }: CallCenterBrandProps) {
  const rootClassName = ['flex items-center gap-4', className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <div className="flex flex-col">
        <span className="text-[1.45rem] font-black leading-[0.95] tracking-[-0.06em] text-[#1b243d] md:text-[2.1rem]">
          Call Center
        </span>
      </div>
    </div>
  );
}
