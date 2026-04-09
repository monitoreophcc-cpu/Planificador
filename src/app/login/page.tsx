import styles from './page.module.css'
import { LoginButton } from './LoginButton'

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const error = resolvedSearchParams?.error

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>Planificador</h1>
        <p className={styles.subtitle}>Sistema de gestión operativa</p>
        {error ? (
          <p className={styles.error}>No se pudo autenticar. Intenta de nuevo.</p>
        ) : null}
        <LoginButton />
      </section>
    </main>
  )
}
