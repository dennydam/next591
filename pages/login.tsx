import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import axios from 'axios'
import '../src/app/globals.css'

// 創建 Axios 實例
const api = axios.create({
  baseURL: '/api',
})

// 添加響應攔截器以處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 請求已發出，但服務器回應狀態碼不在 2xx 範圍內
      return Promise.reject(error.response.data)
    } else if (error.request) {
      // 請求已發出，但未收到響應
      return Promise.reject({ error: '無法連接到伺服器' })
    } else {
      // 在設置請求時觸發了錯誤
      return Promise.reject({ error: '發生錯誤' })
    }
  }
)

const AuthPage: React.FC = () => {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!isLogin && password !== confirmPassword) {
      setError('密碼不匹配')
      setIsLoading(false)
      return
    }

    try {
      const { data } = await api.post('/auth', {
        action: isLogin ? 'login' : 'register',
        username,
        password,
      })
      console.log('data',data)
      if (data.message === 'Registration successful. You can now subscribe to LINE Notify.') {
        setIsLogin(true)
      }
      if (data.user) {
        // 成功登入或註冊
         localStorage.setItem('user', JSON.stringify(data.user));
        if (data.message) {
         switch (data.user.lineNotifyStatus) {
           case 'NEEDS_REAUTHORIZATION':
             console.log('需要重新授權 LINE Notify')
             // 顯示重新授權的提示或者直接重定向到授權頁面
            //  handleReauthorize(data.user.id)
             if (confirm('需要重新授權訂閱,是否重新訂閱')){
                const userId = encodeURIComponent(data.userId.toString())
                const redirectUri = process.env.LINE_NOTIFY_REDIRECT_URI
                const handleSubscribe = () => {
                  // 重定向到 Line Notify 授权页面
                  // 注意：将 YOUR_CLIENT_ID 和 YOUR_REDIRECT_URI 替换为实际值
                  router.push(`https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${process.env.LINE_NOTIFY_CLIENT_ID}&redirect_uri=${redirectUri}&scope=notify&state=${userId}`)
                }
                handleSubscribe()
              
            } break
           case 'NOT_SUBSCRIBED':
             console.log('未訂閱 LINE Notify')
             // 顯示訂閱提示
             if (confirm('你還未訂閱 LINE Notify。是否現在訂閱？')) {
              //  handleSubscribe(data.user.id)
                 const userId = encodeURIComponent(data.userId.toString())
                 const redirectUri = process.env.NEXT_PUBLIC_LINE_NOTIFY_REDIRECT_URI
                 console.log('LINE_NOTIFY_CLIENT_ID',process.env.NEXT_PUBLIC_LINE_NOTIFY_CLIENT_ID)
                 console.log('LINE_NOTIFY_REDIRECT_URI',process.env.NEXT_PUBLIC_LINE_NOTIFY_REDIRECT_URI)
                 const handleSubscribe = async() => {
                   // 重定向到 Line Notify 授权页面
                   // 注意：将 YOUR_CLIENT_ID 和 YOUR_REDIRECT_URI 替换为实际值
                   router.push(`https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_NOTIFY_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LINE_NOTIFY_REDIRECT_URI}&scope=notify&state=${userId}`)
                 }
                 await handleSubscribe()
                //  console.log('data.redirectUrl',data.redirectUrl)
                 //handleSubscribec後接住callback 的重新導向的url
                //  router.push('/591')
             }
             break
           case 'SUBSCRIBED':
             console.log('已訂閱 LINE Notify')
            confirm('已訂閱')
            router.push('/591')
             // 可以顯示一個成功訂閱的消息
             break
           default:
             console.log('未知的 LINE Notify 狀態')
         }
        }
        // 導航到主頁或儀表板
        // router.push('/dashboard')
      }
     
    } catch (error:any) {
      console.log('error',error)
      setError(error.message || '發生未知錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
  <Head>
    <meta name="description" content={isLogin ? '登入頁面' : '註冊頁面'} />
    <link rel="icon" href="/favicon.ico" />
  </Head>

  <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 max-w-md transition-all duration-300 ease-in-out transform hover:scale-105">
    <div className="flex justify-center mb-8">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
    </div>
    {error && <div className="mb-6 text-red-500 text-center font-semibold bg-red-100 py-2 rounded-lg">{error}</div>}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input type="text" placeholder="用戶名 / ID" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <input type="password" placeholder="密碼" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {!isLogin && (
        <div>
          <input type="password" placeholder="確認密碼" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
      )}
      {isLogin && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span className="ml-2 text-sm text-gray-600">記住我</span>
          </label>
          <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">
            忘記密碼?
          </a>
        </div>
      )}
      <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50" disabled={isLoading}>
        {isLoading ? '處理中...' : isLogin ? '登入' : '註冊'}
      </button>
    </form>
    <div className="mt-6 text-center">
      <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out">
        {isLogin ? '還沒有帳號？點此註冊' : '已有帳號？點此登入'}
      </button>
    </div>
  </div>
</div>
  )
}

export default AuthPage
