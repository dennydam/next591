// import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import React from 'react';

const Linenotify = () => {
  return 
};

export default Linenotify;

interface UserSettings {
  userId: string
  lineNotifyToken: string
  searchParams: {
    region: string
    priceRange: string
  }
}

interface TokenResponse {
  access_token: string
  token_type: string
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'userSettings.json')

export async function getLineNotifyToken(code: string): Promise<string> {
  try {
    const response = await axios.post<TokenResponse>('https://notify-bot.line.me/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_NOTIFY_REDIRECT_URI,
        client_id: process.env.NEXT_PUBLIC_LINE_NOTIFY_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_LINE_NOTIFY_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    console.log('response.data', response.data)
    if (response.data && response.data.access_token) {
      return response.data.access_token
    } else {
      throw new Error('Access token not found in the response')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data)
      throw new Error(`Failed to get Line Notify token: ${error.message}`)
    } else {
      console.error('Unexpected error:', error)
      throw new Error('An unexpected error occurred while getting Line Notify token')
    }
  }
  // 实现获取 Line Notify token 的逻辑
  // 这里需要调用 Line Notify API
  return 'dummy_token'
}

// export async function saveUserSettings(settings: UserSettings): Promise<void> {
//   console.log('saveUserSettings', settings)
//   console.log('SETTINGS_FILE', SETTINGS_FILE)
//   const data = await fs.readFile(SETTINGS_FILE, 'utf8').catch(() => '[]')
//   console.log('data', data)
//   const userSettings: UserSettings[] = JSON.parse(data)
//   console.log('userSettings', userSettings)
//   const index = userSettings.findIndex((s) => s.userId === settings.userId)
//   if (index !== -1) {
//     userSettings[index] = settings
//   } else {
//     userSettings.push(settings)
//   }
//   console.log('userSettings', userSettings)

//   await fs.writeFile(SETTINGS_FILE, JSON.stringify(userSettings, null, 2))
// }

// export async function getUserSettings(userId: string): Promise<UserSettings | null> {
//   const data = await fs.readFile(SETTINGS_FILE, 'utf8').catch(() => '[]')
//   const userSettings: UserSettings[] = JSON.parse(data)
//   return userSettings.find((s) => s.userId === userId) || null
// }

export async function verifyLineNotifyToken(token: string): Promise<boolean> {
  if (!token) {
    return false
  }

  try {
    const response = await axios.get('https://notify-api.line.me/api/status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // 如果請求成功，token 有效
    return response.status === 200
  } catch (error) {
    // 如果請求失敗，token 無效或已過期
    console.error('Error verifying Line Notify token:', error)
    return false
  }
}

// export default verifyLineNotifyToken
