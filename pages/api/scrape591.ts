// pages/api/scrape591.ts

import { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()

      // 訪問 591 租屋網
      await page.goto('https://rent.591.com.tw/list', { waitUntil: 'networkidle0' })

      // 等待並點擊地區選擇（以台北市為例）
      await page.waitForSelector('#area-box-body')
      await page.click('#area-box-body .area-box-item:nth-child(2)')

      // 等待並點擊價格範圍（以 10000-20000 為例）
      await page.waitForSelector('#rentPrice-box')
      await page.click('#rentPrice-box')
      await page.waitForSelector('#rentPrice-box-body')
      await page.click('#rentPrice-box-body .price-item:nth-child(3)')

      // 等待頁面加載完成
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      // 獲取當前 URL
      const currentUrl = page.url()

      await browser.close()

      res.status(200).json({ url: currentUrl })
    } catch (error) {
      console.error('Scraping failed:', error)
      res.status(500).json({ error: 'Failed to scrape 591 website' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
