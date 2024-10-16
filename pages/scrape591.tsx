import React, { useState, useRef, useEffect } from 'react'

const UrlObserver: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('https://rent.591.com.tw/list')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleIframeLoad = () => {
      if (iframeRef.current) {
        try {
          setCurrentUrl(iframeRef.current.contentWindow?.location.href || '')
        } catch (error) {
          console.error('無法訪問 iframe URL:', error)
        }
      }
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad)
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [])

  return (
    <div>
      <h1>591 租屋網 URL 觀察器</h1>
      <div>
        <p>當前 URL: {currentUrl}</p>
        <iframe ref={iframeRef} src='https://rent.591.com.tw/' style={{ width: '100%', height: '600px', border: 'none' }} title='591 租屋網' />
      </div>
    </div>
  )
}

export default UrlObserver
