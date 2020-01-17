import React, { useState, useEffect } from 'react'

import './about.scss'

import welcomeTitleImg from 'assets/img/about/welcome.png'
import welcomeBgImg from 'assets/img/about/header-bg.png'
import qrcodeImg from 'assets/img/about/qrcode.jpg'
import iconImg from 'assets/img/about/icon.png'
import avatarImg from 'assets/img/about/avatar.png'
import openSourceImg from 'assets/img/about/open-source.jpg'

export default function About() {
  const [showTeam, setShowTeam] = useState(true)

  useEffect(() => {
    if (document.body.clientWidth > 1200 && document.body.clientWidth < 1330) {
      setShowTeam(false)
    }
  }, [])

  function handleArticle(link: string) {
    window.open(link)
  }

  return (
    <div className='about-container'>
      <div className='lin-info'>
        <div className='lin-info-left'>
          <div className='welcome'>
            <img src={welcomeTitleImg} className='welcome-title' alt='' />
            <div className='subtitle'>
              <div className='guide'>
                您还可以点击林间有风官方网站，查看更多作品
              </div>
              <div className='link'>
                <a
                  href='http://www.7yue.pro'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  http://www.7yue.pro
                </a>
              </div>
            </div>
          </div>
          <img className='welcome-bg' src={welcomeBgImg} alt='' />
        </div>
        <div className='lin-info-right'>
          <div className='team-detail'>
            <div className='team-box'>
              <div className='team-title'>产品团队</div>
              <ul className='team-ul'>
                <li>
                  <span className='shadow-box'>
                    <i className='team-shadow'></i>
                  </span>
                  <span className='team-role'>策划</span>
                  <span className='team-name'>七月</span>
                </li>
                <li>
                  <span className='shadow-box'>
                    <i className='team-shadow'></i>
                  </span>
                  <span className='team-role'>研发</span>
                  <span className='team-name'>
                    {showTeam ? (
                      <ul>
                        <li>Pedro</li>
                        <li>一飞</li>
                        <li>凉面</li>
                        <li>圈圈</li>
                        <li>家乐</li>
                        <li>Jocky</li>
                        <li>流乔</li>
                      </ul>
                    ) : (
                      <ul>
                        <li>林间有风 CMS 组</li>
                      </ul>
                    )}
                  </span>
                </li>
                <li>
                  <span className='shadow-box'>
                    <i className='team-shadow'></i>
                  </span>
                  <span className='team-role'>设计</span>
                  <span className='team-name'>瓜瓜</span>
                </li>
              </ul>
            </div>
            <div className='team-icon'>
              <img src={qrcodeImg} alt='' />
            </div>
            <p className='team-label'>林间有风公众号</p>
          </div>
        </div>
      </div>
      <div className='quantity-statistics'>
        <div className='quantity-item'>
          <div className='quantity-detail'>
            <div className='quantity-detail-box'>
              <div className='quantity-title'>总访问量</div>
              <div className='quantity-border-line'></div>
              <div className='quantity'>11,590</div>
            </div>
          </div>
          <div className='quantity-icon'>
            <img src={iconImg} alt='' />
          </div>
        </div>
        <div className='quantity-item'>
          <div className='quantity-detail'>
            <div className='quantity-detail-box'>
              <div className='quantity-title'>总用户数</div>
              <div className='quantity-border-line'></div>
              <div className='quantity'>51,862</div>
            </div>
          </div>
          <div className='quantity-icon'>
            <img src={iconImg} alt='' />
          </div>
        </div>
        <div className='quantity-item'>
          <div className='quantity-detail'>
            <div className='quantity-detail-box'>
              <div className='quantity-title'>新增访问量 (月)</div>
              <div className='quantity-border-line'></div>
              <div className='quantity'>1,862</div>
            </div>
          </div>
          <div className='quantity-icon'>
            <img src={iconImg} alt='' />
          </div>
        </div>
        <div className='quantity-item'>
          <div className='quantity-detail'>
            <div className='quantity-detail-box'>
              <div className='quantity-title'>新增用户数</div>
              <div className='quantity-border-line'></div>
              <div className='quantity'>1,323</div>
            </div>
          </div>
          <div className='quantity-icon'>
            <img src={iconImg} alt='' />
          </div>
        </div>
      </div>
      <div className='information'>
        <div className='personal'>
          <div className='personal-title'>个人信息</div>
          <img src={avatarImg} className='personal-avatar' alt='' />
          <div className='personal-influence'>
            <div className='personal-influence-item'>
              <div className='personal-influence-num color1'>5411</div>
              <div className='personal-influece-label'>总访问量</div>
            </div>
            <div className='personal-influence-item'>
              <div className='personal-influence-num color2'>913</div>
              <div className='personal-influece-label'>粉丝</div>
            </div>
            <div className='personal-influence-item'>
              <div className='personal-influence-num color3'>72</div>
              <div className='personal-influece-label'>作品</div>
            </div>
          </div>
          {/* <div className='personal-tabs'></div> */}
        </div>
        <div className='article'>
          <div className='article-title'>文章</div>
          <div className='article-list'>
            <div
              className='article-item'
              onClick={() =>
                handleArticle('https://opensource.guide/how-to-contribute/')
              }
            >
              <img className='article-thumb' src={openSourceImg} alt='' />
              <div className='article-detail'>
                <p className='article-detail-title'>
                  How to Contribute to Open Source?
                </p>
                <div className='article-detail-content'>
                  Whether you just made your first open source contribution, or
                  you’re looking for new ways to contribute, we hope you’re
                  inspired to take action. Even if your contribution wasn’t
                  accepted, don’t forget to say thanks when a maintainer put
                  effort into helping you. Open source is made by people like
                  you: one issue, pull request, comment, or high-five at a time.
                </div>
                <div className='article-tool'>
                  <div className='pubdate'>一天前</div>
                  <div className='article-about'>
                    <span>
                      <i className='iconfont icon-shoucang'></i>37
                    </span>
                    {/* <el-divider direction='vertical'></el-divider> */}
                    <span>
                      <i className='iconfont icon-pinglun'></i>2384
                    </span>
                    {/* <el-divider direction='vertical'></el-divider> */}
                    <span>
                      <i className='iconfont icon-fenxiang'></i>56
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className='article-item'
              onClick={() =>
                handleArticle('https://www.zhihu.com/question/269033309')
              }
            >
              <img className='article-thumb' src={openSourceImg} alt='' />
              <div className='article-detail article-last'>
                <p className='article-detail-title'>
                  为什么程序员们愿意在GitHub上开源自己的成果给别人免费使用和学习？
                </p>
                <div className='article-detail-content'>
                  “Git的精髓在于让所有人的贡献无缝合并。而GitHub的天才之处，在于理解了Git的精髓。”来一句我们程序员们接地气的话：分享是一种快乐~
                </div>
                <div className='article-tool'>
                  <div className='pubdate'>2019年5月26日</div>
                  <div className='article-about'>
                    <span>
                      <i className='iconfont icon-shoucang'></i>37
                    </span>
                    {/* <el-divider direction='vertical'></el-divider> */}
                    <span>
                      <i className='iconfont icon-pinglun'></i>2384
                    </span>
                    {/* <el-divider direction='vertical'></el-divider> */}
                    <span>
                      <i className='iconfont icon-fenxiang'></i>56
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
