/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      PingFangRegular: ['PingFang-SC-Regular'],
      PingFangMedium: ['PingFang-SC-Medium'],
      PingFangSCMedium: ['PingFangSC-Medium']
    },
    extend: {
      backgroundImage: {
        active: 'linear-gradient(145deg, #585892, #4a4a7a);', // 激活色渐变色 亮紫色
        cyber: 'linear-gradient(to right, #2d535d, #005271, #004c86, #2b3f90, #642388)', // 赛博蓝渐变色
        'cyber-pro': 'linear-gradient(to right, #2d6170, #006089, #005aa0, #364cac, #792ba4);', // 赛博蓝渐变色↑
        purple: 'linear-gradient(to bottom right, #ae79f1, #9366cb)', // 淡紫色渐变色
        home: 'linear-gradient(to top, #040c17, #0d1821, #10212b, #132b35, #16353e)' // 深蓝灰转深蓝绿
      },
      colors: {
        gray: '#869d9d', // 非激活色 淡紫灰色
        active: '#a57bea', // 激活色 亮紫色
        'active-pro': '#c08eaf', // 激活色↑ 罗兰紫
        'dark-con': '#436565', // 暗色稍微亮一点
        dark: '#254852', // 暗色 深蓝绿
        'dark-pro': '#152431', // 暗色↑
        light: '#e2e1e4', // 亮色 芡食白
        text1: '#d8e3e7', // 云峰白
        text2: '#baccd9', // 云水蓝
        'white/70': '#ffffff70' // 白色透明度70%
      },
      keyframes: {
        click: {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' },
          '20%': {
            transform: 'scale(0.95) translateY(1px)'
          },
          '80%': { transform: 'scale(0.95) translateY(1px)' },
          '100%': { transform: 'scale(1)' }
        },
        popup: {
          '0%': { opacity: 0 },
          '100%': { transform: 'translateY(-12px)', opacity: 1 }
        },
        'scale-down-entrance': {
          '0%': { transform: 'scale(1.1)', opacity: 0.5 },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        click: 'click 0.2s ease-in-out',
        popup: 'popup 0.2s ease-in-out forwards',
        'scale-down-entrance': 'scale-down-entrance 0.3s ease-in-out forwards'
      },
      boxShadow: {
        green: '20px 20px 60px #93b58a, -20px -20px 60px #c7f5ba'
      }
    }
  },
  plugins: []
}
