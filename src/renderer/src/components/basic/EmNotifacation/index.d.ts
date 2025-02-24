declare interface NotificationParams {
  // 唯一标识
  key: string
  // 标题
  title?: string
  // 通知类型
  type: 'success' | 'error' | 'warning' | 'info'
  // 内容
  content: string
  // 持续时间（ms）
  duration?: number
  // 关闭回调
  onClose?: () => void
  // 自定义底部
  footer?: ReactNode
  // 徽标
  badge?: number
  // 残余时间
  life?: number
  // 暂停计时
  paused?: boolean
}

declare interface NotificationContextType {
  notify: (param: NotificationParams) => void
  cancel: (key: string) => void
}

declare interface NotificationListProps {
  notifications: NotificationParams[]
  onHover: (key: string, isHover: boolean) => void
}
