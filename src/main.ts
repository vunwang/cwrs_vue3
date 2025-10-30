import { createApp } from 'vue'
import ArcoVue, { Card, Drawer, Modal } from '@arco-design/web-vue'
import '@/styles/arco-ui/index.less'
// 引入自定义的deepScss
import '@/assets/deepScss/index.scss'
import '@/assets/deepScss/zdy.scss'
// 额外引入 Arco Design Icon图标库
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue'
import router from './router'
// 使用动画库
import 'animate.css/animate.min.css'

// 自定义过渡动画
import '@/styles/css/transition.css'

// 导入全局scss主文件
import '@/styles/index.scss'

// 支持SVG
import 'virtual:svg-icons-register'

// 自定义指令
import directives from './directives'

// 状态管理
import pinia from '@/stores'

// 安装 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入暗色模式样式（关键）
import 'element-plus/theme-chalk/dark/css-vars.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import locale from 'element-plus/es/locale/lang/zh-cn'// 引入中文语言包

// 对特定组件进行默认配置
Card.props.bordered = false

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
Modal._context = app._context
Drawer._context = app._context

app.use(router)
app.use(pinia)
app.use(ArcoVue)
app.use(ArcoVueIcon)
app.use(directives)
// 配置 Element Plus 为中文
app.use(ElementPlus, {
  locale: locale,
})
app.mount('#app')


