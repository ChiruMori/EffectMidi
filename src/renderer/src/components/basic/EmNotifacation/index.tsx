import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import NotificationList from './container'

const COUNTER_DELAY = 20
export const EXIT_ANIMATION_DURATION = 500

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationParams[]>([])
  // 鼠标悬停时，所在的通知暂停计时
  const handleHover = (key: string, isHover: boolean): void => {
    setNotifications((prev) =>
      prev.map((msg) =>
        msg.key === key
          ? {
              ...msg,
              paused: isHover
            }
          : msg
      )
    )
  }

  const notify = (message: NotificationParams): void => {
    // key 已存在时，仅增加徽标，并重置持续时间，更新顺序
    const existIndex = notifications.findIndex((msg) => msg.key === message.key)
    message.duration = message.duration ?? 5000
    message.life = message.duration
    if (message.life !== -1) {
      message.life += EXIT_ANIMATION_DURATION
    }
    if (existIndex !== -1) {
      const existMessage = notifications[existIndex]
      setNotifications((prev) => [
        { ...existMessage, ...message, badge: (existMessage.badge || 0) + 1 },
        ...prev.slice(0, existIndex),
        ...prev.slice(existIndex + 1)
      ])
      return
    }
    setNotifications((prev) => [message, ...prev])
  }

  const cancel = (key): void => {
    // 将指定通知的 life 设置为 EXIT_ANIMATION_DURATION，触发退出动画
    setNotifications((prev) =>
      prev.map((msg) => {
        if (msg.key === key) {
          msg.life = EXIT_ANIMATION_DURATION
        }
        return msg
      })
    )
  }

  // 定时器，自动扫描并关闭通知（20ms一次，30fps）
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((msg) => {
          if (msg.paused) {
            return true
          }
          if (msg.life === -1) {
            return true
          }
          if (msg.life === undefined) {
            return false
          }
          if (msg.life > 0) {
            msg.life -= COUNTER_DELAY
            return true
          }
          return false
        })
      )
    }, COUNTER_DELAY)
    return (): void => clearInterval(timer)
  }, [])

  return (
    <NotificationContext.Provider value={{ notify, cancel }}>
      {children}
      <NotificationList notifications={notifications} onHover={handleHover} />
    </NotificationContext.Provider>
  )
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    console.error('useNotification must be used within a NotificationProvider')
    return {} as NotificationContextType
  }
  return context
}
