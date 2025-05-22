'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function MyIngredientsPage() {
  const [ingredients, setIngredients] = useState([])           // 보유 재료 목록
  const [ingredientList, setIngredientList] = useState([])     // 기준 재료 목록
  const [form, setForm] = useState({                            // 직접 추가 폼 (customName 사용)
    userId: '1',
    customName: '',
    purchaseDate: '',
    expiryDate: '',
    isFrozen: false,
  })
  const [selectedIngredientId, setSelectedIngredientId] = useState('')  // 기준 재료 선택

  // 보유 재료 목록 조회
  const fetchIngredients = () => {
    axios
      .get('http://localhost:8080/user-ingredients?userId=1')
      .then((res) => setIngredients(res.data))
      .catch((err) => console.error('재료 불러오기 실패', err))
  }

  // 기준 재료 목록 조회
  const fetchIngredientList = () => {
    axios
      .get('http://localhost:8080/ingredients')
      .then((res) => setIngredientList(res.data))
      .catch((err) => console.error('기준 재료 불러오기 실패', err))
  }

  useEffect(() => {
    fetchIngredients()
    fetchIngredientList()
  }, [])

  // 직접 추가 폼 입력 변경
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // 직접 추가 등록 (ingredientId 없이 customName으로 등록)
  const handleSubmit = async () => {
    if (!form.customName) {
      alert('재료명을 입력하거나 기준 재료 선택을 이용하세요.')
      return
    }
    try {
      await axios.post('http://localhost:8080/user-ingredients', {
        userId: form.userId,
        ingredientId: null,
        customName: form.customName,
        purchaseDate: form.purchaseDate || null,
        expiryDate: form.expiryDate || null,
        isFrozen: form.isFrozen,
      })
      alert('직접 재료 등록 완료')
      setForm({
        userId: '1',
        customName: '',
        purchaseDate: '',
        expiryDate: '',
        isFrozen: false,
      })
      fetchIngredients()
    } catch (err) {
      console.error('등록 실패', err)
      alert('등록 실패')
    }
  }

  // 기준 재료 선택 후 등록
  const handleSelectSubmit = async () => {
    if (!selectedIngredientId) {
      alert('기준 재료를 선택하세요.')
      return
    }
    try {
      await axios.post('http://localhost:8080/user-ingredients', {
        userId: '1',
        ingredientId: selectedIngredientId,
        purchaseDate: null,
        expiryDate: null,
        isFrozen: false,
      })
      alert('기준 재료 등록 완료')
      setSelectedIngredientId('')
      fetchIngredients()
    } catch (err) {
      console.error('등록 실패', err)
      alert('등록 실패')
    }
  }

  // 재료 삭제
  const handleDelete = async (id) => {
    if (!confirm('정말 삭제할까요?')) return
    try {
      await axios.delete(`http://localhost:8080/user-ingredients/${id}`)
      alert('삭제 완료')
      fetchIngredients()
    } catch (err) {
      console.error('삭제 실패', err)
      alert('삭제 실패')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>냉장고 재고</h1>

      {/* 보유 재료 리스트 (카드형) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ingredients.map((item) => (
            <li
              key={item.id}
              style={{
                border: '1px solid #ddd',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <strong>{item.name}</strong>
                {item.frozen && <span> ❄️ (냉동)</span>}
              </span>
              <button onClick={() => handleDelete(item.id)}>🗑</button>
            </li>
          ))}
        </ul>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      {/* 기준 재료 선택 + 등록 */}
      <h2>📋 기준 재료 선택</h2>
      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedIngredientId}
          onChange={(e) => setSelectedIngredientId(e.target.value)}
          style={{ padding: '0.5rem', width: '100%' }}
        >
          <option value="">-- 재료를 선택하세요 --</option>
          {ingredientList.map((item) => (
            <option key={item.id} value={item.id}>
              [{item.category}] {item.name}
            </option>
          ))}
        </select>
        <button
          style={{ marginTop: '0.5rem' }}
          onClick={handleSelectSubmit}
        >
          기준 재료 등록
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      {/* 직접 추가 폼 */}
      <h2>➕ 재료 직접 추가</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>재료명: </label>
        <input
          name="customName"
          value={form.customName}
          onChange={handleChange}
          placeholder="예: 마라탕 육수"
        />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>구매일자: </label>
        <input
          type="date"
          name="purchaseDate"
          value={form.purchaseDate}
          onChange={handleChange}
        />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <label>소비기한: </label>
        <input
          type="date"
          name="expiryDate"
          value={form.expiryDate}
          onChange={handleChange}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          냉동 보관 여부:
          <input
            type="checkbox"
            name="isFrozen"
            checked={form.isFrozen}
            onChange={handleChange}
          />
        </label>
      </div>
      <button onClick={handleSubmit}>직접 재료 추가</button>
    </main>
  )
}
