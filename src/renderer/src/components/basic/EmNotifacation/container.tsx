import React from 'react'
import { useAppSelector } from '@renderer/common/store'
import C from '@renderer/common/colors'
import {
  XCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/20/solid'
import './index.d'

import { EXIT_ANIMATION_DURATION } from './index'
import { themeSelector } from '@renderer/config'

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const colorType = useAppSelector(themeSelector)

  return (
    <div className="notification-container z-50 max-w-sm fixed top-4 right-4 overflow-hidden pointer-events-none">
      {notifications.map((message) => (
        <div
          key={message.key}
          className={`relative focus:outline-none float-right pointer-events-auto animate__animated animate__faster ${!message.life || message.life === -1 || message.life > EXIT_ANIMATION_DURATION ? 'animate__fadeInRight' : 'animate__fadeOutRight'}`}
        >
          <div className="z-10 overflow-y-auto">
            <div className="min-h-full m-2">
              <div className="overflow-hidden w-full max-w-xs rounded-xl bg-white/5 p-6 backdrop-blur-2xl data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
                <h3 className="text-base/7 font-medium text-white flex items-center">
                  <span className="mr-2 size-5">
                    {
                      {
                        success: <CheckCircleIcon />,
                        warning: <ExclamationCircleIcon />,
                        error: <XCircleIcon />,
                        info: <InformationCircleIcon />
                      }[message.type]
                    }
                  </span>
                  <span>{message.title || ''}</span>
                  {message.badge && (
                    <span
                      className="badge ml-2 text-xs/5 px-1.5 rounded-full absolute right-5 animate__animated animate__faster animate__bounceIn"
                      style={{
                        backgroundImage: C(colorType).ingridient(45)
                      }}
                    >
                      {message.badge}
                    </span>
                  )}
                </h3>
                <p className="mt-2 text-sm/6 text-white/50">{message.content}</p>
                {message.footer && <div className="mt-4">{message.footer}</div>}
                {/* 进度条 */}
                <div className="absolute bottom-0 left-0 w-full">
                  <div
                    className="h-1"
                    style={{
                      backgroundImage: C(colorType).ingridient(45),
                      width: `${(!message.life || message.life === -1 ? 1 : (message.life - EXIT_ANIMATION_DURATION) / message.duration!) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationList
