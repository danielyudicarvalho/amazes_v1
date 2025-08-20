import { Share } from '@capacitor/share'

export async function shareChallenge(timeMs: number) {
  const seconds = (timeMs / 1000).toFixed(2)
  const url = location.href
  const text = `Venci o Labirinto do Dia em ${seconds}s. Você supera? \n${url}`

  // Native (Capacitor) share
  try {
    await Share.share({
      title: 'Maze Puzzler',
      text,
      url,
      dialogTitle: 'Compartilhar desafio',
    })
    return
  } catch {}

  // Web Share API fallback
  if ((navigator as any).share) {
    try { await (navigator as any).share({ title: 'Maze Puzzler', text, url }) } catch {}
    return
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(text)
    alert('Link copiado!')
  } catch {
    alert(text)
  }
}