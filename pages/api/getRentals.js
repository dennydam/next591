// pages/api/getRentals.js
import axios from 'axios'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // 設置必要的 headers
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Referer: 'https://rent.591.com.tw/',
      }

      // 發送請求到 591 API  https://bff-house.591.com.tw/v1/web/rent/list?regionid=3
      const response = await axios.get('https://bff-house.591.com.tw/v1/web/rent/list?regionid=3&sectionid=26&multiPrice=10000_15000&order=posttime&orderType=desc', {
        headers: headers,
        params: {
          // 這裡可以添加查詢參數，例如：
          // region: 1,  // 地區代碼
          // kind: 1,    // 房屋類型
          // rentprice: '0,10000'  // 租金範圍
        },
      })

      // 返回 API 響應
      console.log(response.data)
      res.status(200).json(response.data)
    } catch (error) {
      console.error('Error fetching data from 591:', error)
      res.status(500).json({ error: 'Failed to fetch data from 591' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
