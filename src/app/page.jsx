'use client'

import Link from 'next/link'
import Header from '../components/layout/Header'
import BottomNavigation from '../components/layout/BottomNavigation'
import RecommendationsPage from './pages/recommend-cuisine-type/page'

export default function Home() {
  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>냉장GO MVP</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <Link href="/my-ingredients">
              <button style={{ padding: '0.5rem 1rem' }}>🍱 냉장고 보러가기</button>
            </Link>
          </li>
        </ul>
        <RecommendationsPage />
      </main>
      <BottomNavigation />
    </>
  )
}
