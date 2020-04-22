import React from 'react'

import { IMessage } from '@/types/store'

import './style/notify-overlay.scss'

interface IProps {
  messages: IMessage[]
}

export default function NotifyOverlay({ messages = [] }: IProps) {
  function readAll() {
    console.log('你点击了readAll')
  }

  function viewAll() {
    console.log('你点击了viewAll')
  }

  return (
    <div className='notify-overlay-container'>
      <div className='notify-title'>
        <p>消息提醒</p>
        <p className='button' onClick={readAll}>
          全部已读
        </p>
      </div>
      <div className='content'>
        <div className='css-nomessage' r-if={messages.length === 0}>
          <div className='css-sumlaa'>
            <svg
              width='150'
              height='120'
              viewBox='0 0 150 120'
              fill='currentColor'
            >
              <path
                fill='#EBEEF5'
                d='M46.76 78.71a1.895 1.895 0 0 0-1.378 2.092c.13.948.94 1.648 1.904 1.635h55.468a1.882 1.882 0 0 0 1.884-1.635c.13-.95-.46-1.846-1.367-2.09a8.61 8.61 0 0 1-6.4-7.872l-2.473-20.928c-.96-7.872-6.567-14.37-14.178-16.435l-.986-.267-.113-1.014c-.24-2.106-2.01-3.696-4.11-3.696s-3.87 1.59-4.104 3.696l-.114 1.014-.98.267c-7.61 2.063-13.22 8.563-14.18 16.43L53.15 70.84c-.2 3.74-2.79 6.926-6.393 7.87zm50.61-29.155l2.482 20.982c.127 2.562 1.817 4.654 4.19 5.276a4.895 4.895 0 0 1 3.568 5.397c-.336 2.446-2.434 4.26-4.876 4.227H47.306a4.883 4.883 0 0 1-4.896-4.227 4.897 4.897 0 0 1 3.58-5.4 5.614 5.614 0 0 0 4.17-5.168l2.49-21.093c1.068-8.77 7.135-16.06 15.46-18.7.807-3.11 3.615-5.35 6.9-5.35s6.094 2.24 6.9 5.35c8.325 2.64 14.393 9.93 15.46 18.7zm-16.417 38.91c-.288 3.184-3.007 5.36-5.943 5.36-2.936 0-5.655-2.176-5.943-5.36l-2.988.27c.43 4.82 4.52 8.09 8.93 8.09s8.49-3.27 8.93-8.09l-2.99-.27z'
              />
            </svg>
            <div>还没有消息</div>
          </div>
        </div>
        {messages.length > 0 &&
          messages.map((item, index) => (
            // <div className='message-item' key={item.id}>
            <div className='message-item' key={index}>
              <p
                className={`${
                  item.is_read ? 'read-messages' : 'unread-messages'
                }`}
              >
                {item.content}
              </p>
              <div className='sketch-information'>
                <p className='user'>{item.user}</p>
                <p className='date-time'>{item.time}</p>
              </div>
            </div>
          ))}
      </div>
      <div className='notify-footer'>
        <p className='view-all' onClick={viewAll}>
          查看全部 &gt;
        </p>
      </div>
    </div>
  )
}
