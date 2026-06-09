import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Acceso a Padres | PsiAgend",
  description: "Inicia sesión en tu cuenta para agendar y gestionar citas de tus pequeños.",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
      
      {/* Sección Izquierda: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-24 relative z-10 bg-white rounded-r-[3rem] shadow-[10px_0_30px_rgba(0,0,0,0.03)]">
        
        {/* Cabecera */}
        <header className="flex justify-start">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-3 text-primary">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center rotate-3">
              <span className="text-primary-foreground text-xl font-bold">P</span>
            </div>
            PsiAgend.
          </Link>
        </header>
        
        {/* Contenido Principal */}
        <main className="flex-1 flex flex-col justify-center mt-12 mb-12">
          <div className="w-full max-w-sm mx-auto space-y-10">
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-foreground">Portal de Padres</h1>
              <p className="text-muted-foreground text-base font-medium leading-relaxed">
                Accede para revisar los avances, gestionar próximas citas y acompañar el proceso de tus pequeños.
              </p>
            </div>
            <LoginForm />
          </div>
        </main>
        
        {/* Pie de página */}
        <footer className="w-full text-left">
          <p className="text-sm text-muted-foreground font-bold">
            Área segura y confidencial.
          </p>
        </footer>
      </div>

      {/* Sección Derecha: Imagen Infantil */}
      <div className="hidden lg:block lg:w-1/2 relative bg-purple-50">
        <Image
          src="/login-bg-kids.png"
          alt="Ambiente cálido y acogedor para niños"
          fill
          className="object-cover object-center mix-blend-multiply opacity-90"
          priority
        />
        
        <div className="absolute bottom-16 right-16 left-16 p-8 bg-white/80 backdrop-blur-xl rounded-[2rem] border-2 border-white shadow-xl shadow-purple-900/5">
           <blockquote className="space-y-4">
             <p className="text-xl text-foreground font-bold leading-relaxed">
               &quot;Ver a nuestra hija volver a sonreír con confianza ha sido el mejor regalo. Las sesiones son como un juego para ella, pero los resultados son invaluables.&quot;
             </p>
             <footer className="text-base text-primary font-black">
               — Familia Martínez
             </footer>
           </blockquote>
        </div>
      </div>
    </div>
  )
}
