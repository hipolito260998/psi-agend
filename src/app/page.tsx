import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      
      {/* Navbar Minimalista e Infantil */}
      <header className="absolute top-0 z-50 w-full bg-transparent">
        <div className="container flex h-24 items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-primary">PsiAgend.</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-8">
            <Link href="/login" className="text-sm sm:text-base font-bold text-foreground/80 hover:text-primary transition-colors">
              <span className="hidden sm:inline">Acceso a Padres</span>
              <span className="sm:hidden">Acceso</span>
            </Link>
            <Link href="/agendar">
              <Button variant="default" className="rounded-full px-4 sm:px-8 h-10 sm:h-12 text-sm sm:text-base font-bold shadow-md bg-primary hover:bg-primary/90 text-white border-2 border-transparent hover:border-violet-200 transition-all">
                <span className="hidden sm:inline">Reservar Cita</span>
                <span className="sm:hidden">Agendar</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section Infantil */}
        <section className="w-full min-h-screen flex items-center pt-24 pb-12">
          <div className="container px-6 lg:px-12 grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
            
            <div className="flex flex-col space-y-8 max-w-xl">
              <div className="inline-flex items-center rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground w-fit shadow-sm border border-border">
                <span className="flex h-3 w-3 rounded-full bg-primary mr-3 animate-pulse"></span>
                Horarios disponibles esta semana
              </div>
              <h1 className="text-5xl font-black tracking-tight md:text-6xl lg:text-[4.5rem] text-foreground leading-[1.1]">
                Un espacio seguro para crecer.
              </h1>
              <p className="text-xl leading-relaxed text-muted-foreground font-medium max-w-md">
                Psicología infantil en un ambiente cálido, lúdico y diseñado especialmente para que tus pequeños se sientan como en casa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/agendar">
                  <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold w-full sm:w-auto shadow-lg shadow-violet-200 bg-primary hover:bg-violet-500 text-white transition-all hover:-translate-y-1">
                    Agenda tu primera sesión
                  </Button>
                </Link>
                <Link href="#detalles">
                  <Button variant="outline" size="lg" className="rounded-full h-14 px-10 text-lg font-bold w-full sm:w-auto border-2 border-primary/20 text-primary hover:bg-primary/10">
                    Conoce más
                  </Button>
                </Link>
              </div>
            </div>

            {/* Imagen Principal Infantil */}
            <div className="relative aspect-[4/5] lg:aspect-square w-full max-w-lg mx-auto lg:ml-auto">
              <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image 
                  src="/landing-hero-kids.png" 
                  alt="Cuarto de juegos y terapia infantil" 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-yellow-300 rounded-full -z-10 mix-blend-multiply opacity-50 blur-xl"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-sky-300 rounded-full -z-10 mix-blend-multiply opacity-50 blur-xl"></div>
            </div>
            
          </div>
        </section>

        {/* Features Bento Soft Infantil */}
        <section id="detalles" className="w-full py-32 bg-white">
          <div className="container px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              
              <div className="bg-sky-50 rounded-[2.5rem] p-10 md:col-span-2 flex flex-col justify-end min-h-[300px] border-2 border-sky-100 transition-transform duration-500 hover:-translate-y-2">
                <h3 className="text-3xl font-black tracking-tight mb-4 text-sky-900">Terapia a través del juego</h3>
                <p className="text-sky-800/80 max-w-md text-lg leading-relaxed font-medium">
                  Utilizamos herramientas lúdicas y creativas para ayudar a los niños a expresar sus emociones en un entorno donde se sienten seguros y comprendidos.
                </p>
              </div>

              <div className="bg-purple-100 rounded-[2.5rem] p-10 flex flex-col justify-end min-h-[300px] border-2 border-purple-200 transition-transform duration-500 hover:-translate-y-2">
                <h3 className="text-2xl font-black tracking-tight mb-3 text-purple-900">Acompañamiento</h3>
                <p className="text-purple-800/80 leading-relaxed font-medium">
                  Trabajamos en equipo con los padres para lograr el mejor desarrollo.
                </p>
              </div>

              <div className="bg-violet-400 text-white rounded-[2.5rem] p-10 flex flex-col justify-end min-h-[300px] shadow-lg shadow-violet-200 transition-transform duration-500 hover:-translate-y-2">
                <h3 className="text-2xl font-black tracking-tight mb-3">Horarios Flexibles</h3>
                <p className="text-violet-50 leading-relaxed font-medium">
                  Sabemos que la rutina escolar es importante, por eso ofrecemos citas en horarios adaptados a ti.
                </p>
              </div>

              <div className="bg-pink-50 rounded-[2.5rem] p-10 md:col-span-2 flex flex-col justify-end min-h-[300px] border-2 border-pink-100 transition-transform duration-500 hover:-translate-y-2">
                <h3 className="text-3xl font-black tracking-tight mb-4 text-pink-900">Ambiente Diseñado para Ellos</h3>
                <p className="text-pink-800/80 max-w-md text-lg leading-relaxed font-medium">
                  Colores cálidos, mobiliario a su altura y sin batas blancas. Un consultorio donde ir al psicólogo se siente como ir a jugar.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full bg-purple-50 py-16 border-t-4 border-purple-100">
        <div className="container px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-3xl font-black tracking-tighter text-primary">PsiAgend.</div>
          <p className="text-base text-muted-foreground text-center font-bold">
            Cuidando sonrisas y mentes. © {new Date().getFullYear()}
          </p>
          <div className="flex gap-8 text-base font-bold text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Aviso para Padres</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
