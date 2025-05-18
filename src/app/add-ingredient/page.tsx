'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function AddIngredientPage() {
  const [ingredients, setIngredients] = useState([])
  const router = useRouter()

  useEffect(() => {
    axios.get('http://localhost:8080/ingredients')
      .then((res) => setIngredients(res.data))
      .catch((err) => console.error('재료 불러오기 실패', err))
  }, [])

  const handleSelect = (id) => {
    router.push(`/add-ingredient/direct?ingredientId=${id}`)
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>기준 재료 선택</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {ingredients.map((item) => (
          <li
            key={item.id}
            style={{
              border: '1px solid #ccc',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              cursor: 'pointer',
            }}
            onClick={() => handleSelect(item.id)}
          >
            {item.name}
          </li>
        ))}
      </ul>

      <button onClick={() => router.push('/add-ingredient/direct')}>
        ➕ 직접 추가
      </button>
    </main>
  )
}
