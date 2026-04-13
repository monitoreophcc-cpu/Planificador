import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-black text-red-600/10 select-none">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Página no encontrada</h2>
          <p className="text-slate-500">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
