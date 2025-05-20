'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'

export default function DirectAddPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ingredientId = searchParams.get('ingredientId') || ''

  const [form, setForm] = useState({
    userId: '1',
    ingredientId: ingredientId,
    purchaseDate: '',
    expiryDate: '',
    isFrozen: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8080/user-ingredients', form)
      alert('등록 완료')
      router.push('/my-ingredients')
    } catch (error) {
      console.error('등록 실패', error)
      alert('등록 중 오류 발생')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>재료 직접 추가</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>재료 ID: </label>
        <input
          name="ingredientId"
          value={form.ingredientId}
          onChange={handleChange}
          placeholder="예: 1"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>구매일자: </label>
        <input type="date" name="purchaseDate" onChange={handleChange} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>소비기한: </label>
        <input type="date" name="expiryDate" onChange={handleChange} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          냉동 보관 여부:{' '}
          <input
            type="checkbox"
            name="isFrozen"
            checked={form.isFrozen}
            onChange={handleChange}
          />
        </label>
      </div>

      <button onClick={handleSubmit}>완료</button>
    </main>
  )
}
