'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
      setIsLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium px-2 text-muted-foreground">Correo electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="correo@ejemplo.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-zinc-50 border-transparent rounded-full h-12 px-6 focus-visible:ring-1 focus-visible:ring-zinc-300 focus-visible:bg-white shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <Label htmlFor="password" className="font-medium text-muted-foreground">Contraseña</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-zinc-50 border-transparent rounded-full h-12 px-6 focus-visible:ring-1 focus-visible:ring-zinc-300 focus-visible:bg-white shadow-sm"
            />
          </div>
        </div>
          
        {error && (
          <div className="text-sm text-destructive font-medium text-center bg-destructive/10 py-2 rounded-full">
            {error}
          </div>
        )}

        <Button className="w-full rounded-full h-12 text-base font-medium shadow-sm mt-8" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Verificando..." : "Entrar al portal"}
        </Button>
      </form>
    </div>
  )
}
