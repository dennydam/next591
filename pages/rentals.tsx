// pages/rentals.tsx
import { useState } from 'react'
import '../src/app/globals.css'
import axios from 'axios'

// 定義租屋資料的介面
interface Rental {
  post_id: string
  title: string
  price: string
  section_name: string
  street_name: string
}

// 定義 API 響應的介面
interface ApiResponse {
  data: {
    data: Rental[]
  }
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRentals = async () => {
    setLoading(true)
    setError(null)
    try {
      // const response = await axios.get<ApiResponse>('/api/getRentals')
      const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Referer: 'https://rent.591.com.tw/',
    }

    const response = await axios.get(`https://bff-house.591.com.tw/v1/web/rent/list?regionid=${'1'}&sectionid=${'1'}&multiPrice=${0}_${20000}&order=posttime&orderType=desc&other=balcony_1`, {
      headers: headers,
    })
      console.log('responese.data.data', response.data.data)
      setRentals(response.data.data.data)
    } catch (err) {
      setError('無法獲取租屋資料')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>591 租屋資訊</h1>
      <button onClick={fetchRentals} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' disabled={loading}>
        {loading ? '載入中...' : '獲取租屋資訊'}
        
      </button>

      {error && <p className='text-red-500 mt-4'>{error}</p>}

      {rentals.length > 0 && (
        <div className='mt-4'>
          <h2 className='text-xl font-semibold'>租屋列表：</h2>
          <ul className='list-disc pl-5'>
            {rentals.map((rental) => (
              <li key={rental.post_id} className='mt-2'>
                {rental.title} - {rental.price} 元/月
                <br />
                地址：{rental.section_name} {rental.street_name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
