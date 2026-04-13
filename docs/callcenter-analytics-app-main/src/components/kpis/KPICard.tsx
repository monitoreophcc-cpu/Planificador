type Props = {
  title: string;
  value: number | string;
  status?: 'success' | 'danger' | 'neutral';
  valueColor?: string;
};

export default function KPICard({ title, value, status = 'neutral', valueColor }: Props) {
  const borderColors = {
    success: 'border-green-500',
    danger: 'border-red-600',
    neutral: 'border-slate-200'
  };
  
  const borderColor = borderColors[status];
  
  return (
    <div className={`rounded-xl bg-white p-6 shadow-md border-t-4 ${borderColor} flex flex-col items-center justify-center text-center space-y-4 transition-all hover:scale-105 duration-300`}>
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{title}</p>
      <p className={`text-4xl font-black ${valueColor || 'text-red-700'}`}>{value}</p>
    </div>
  );
}
