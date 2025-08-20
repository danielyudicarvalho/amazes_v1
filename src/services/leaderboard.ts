import { addDoc, collection, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore'
import { getDb } from './firebase'
import { dailySeed } from '../utils/rng'

const COL = 'daily_times'

export async function submitDailyTime(timeMs: number) {
  const db = getDb()
  const day = dailySeed()
  await addDoc(collection(db, COL), {
    day,
    timeMs,
    createdAt: serverTimestamp(),
  })
}

export async function getDailyTopN(n = 10) {
  const db = getDb()
  const day = dailySeed()
  const q = query(collection(db, COL), where('day', '==', day), orderBy('timeMs', 'asc'), limit(n))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data()) as { day: number; timeMs: number }[]
}