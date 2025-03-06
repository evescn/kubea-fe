import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue'
import '@arco-design/web-vue/dist/arco.css'
import router from './router'
import pinia from '@/stores/index'
import { useServiceStore } from '@/stores'
import '@/assets/main.scss'

// 导入 自定义 button
import CButton from '@/components/CButton/index.vue'
import MainHead from '@/components/MainHead/index.vue'

//codemirror编辑器
import { GlobalCmComponent } from 'codemirror-editor-vue3'
// 引入主题 可以从 codemirror/theme/ 下引入多个
import 'codemirror/theme/dracula.css'
// 引入语言模式 可以从 codemirror/mode/ 下引入多个
import 'codemirror/mode/yaml/yaml.js'

const app = createApp(App)
//自定义button 注册
app.component('c-button', CButton)
app.component('MainHead', MainHead)

const initGlobalData = async () => {
    const serviceStore = useServiceStore()
    // 获取 service 数据
    serviceStore.getServiceInfo()
}

app.use(GlobalCmComponent, { componentName: 'codemirror' }).use(ArcoVue).use(pinia).use(router).use(ArcoVueIcon).mount('#app')

initGlobalData()
