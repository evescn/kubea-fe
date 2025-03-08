<template>
    <div>
        <a-card :bodyStyle="{ padding: '10px' }">
            <a-row>
                <a-col :span="20">
                    <div style="text-align: left">
                        <!-- 选择框 -->
                        <!--  K8S集群环境选择框：当收到父组件传过来的namespace属性为true时,才展示这个选择框 -->
                        <span v-if="namespace" style="font-size: 14px">命名空间：</span>
                        <a-select v-if="namespace" v-model:value="namespaceValue" placeholder="请选择" show-search size="small" style="width: 140px; margin-right: 20px" @change="nsChange">
                            <a-select-option v-for="(item, index) in namespaceList" :key="index" :value="item.metadata.name">
                                {{ item.metadata.name }}
                            </a-select-option>
                        </a-select>
                        <!-- CICD环境选择框：当收到父组件传过来的 en 属性为true时，才展示这个选择框 -->
                        <span v-if="en" style="font-size: 14px">环境：</span>
                        <a-select v-if="en" v-model:value="enValue" placeholder="请选择" show-search size="small" style="width: 140px; margin-right: 20px" @change="enChange">
                            <a-select-option value="">全部</a-select-option>
                            <a-select-option v-for="(item, index) in enList" :key="index" :value="item">
                                {{ item }}
                            </a-select-option>
                        </a-select>
                        <!-- CICD 仓库 选择框：当收到父组件传过来的 repo 属性为true时，才展示这个选择框 -->
                        <span v-if="repo" style="font-size: 14px">仓库组：</span>
                        <a-select v-if="repo" v-model:value="repoValue" placeholder="请选择" show-search size="small" style="width: 140px; margin-right: 20px" @change="repoChange">
                            <a-select-option value="">全部</a-select-option>
                            <a-select-option v-for="(item, index) in repoList" :key="index" :value="item">
                                {{ item }}
                            </a-select-option>
                        </a-select>
                        <!-- 环境选择框：当收到父组件传过来的 urlEnv 属性为true时，才展示这个选择框 -->
                        <span v-if="urlEnv" style="font-size: 14px">环境：</span>
                        <a-select v-if="urlEnv" v-model:value="urlEnvValue" placeholder="请选择" show-search size="small" style="width: 140px; margin-right: 20px" @change="urlEnvChange">
                            <a-select-option v-for="(item, index) in urlEnvList" :key="index" :value="item.name">
                                {{ item.name }}
                            </a-select-option>
                        </a-select>
                        <!-- 搜索框 -->
                        <a-input v-model:value="searchValue" :placeholder="searchDescribe" allow-clear size="small" style="width: 200px; margin-right: 10px" @change="searchChange"> </a-input>
                        <a-button ghost size="small" type="primary" @click="$emit('dataList')">
                            <template #icon>
                                <SearchOutlined />
                            </template>
                            搜索
                        </a-button>
                    </div>
                </a-col>
                <a-col :span="4">
                    <div style="text-align: right">
                        <a-button v-if="add" ghost size="small" style="margin-right: 10px" type="primary" @click="$emit('addFunc')">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            新增
                        </a-button>
                        <a-button size="small" @click="$emit('dataList')">
                            <template #icon>
                                <UndoOutlined />
                            </template>
                            刷新
                        </a-button>
                    </div>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import common from '@/config'
import httpClient from '@/request'
import { message } from 'ant-design-vue'

export default {
    //定义父传子的属性
    name: 'MainHead',
    props: {
        namespace: { type: Boolean, default: false },
        en: { type: Boolean, default: false },
        repo: { type: Boolean, default: false },
        urlEnv: { type: Boolean, default: false },
        searchDescribe: { type: String, default: '' },
        add: { type: Boolean, default: false }
    },
    //定义子传父的事件
    //namespaceChange 当namespace放生变化时，要把最新的namespace的值给到父组件
    //namespaceList 当deployment、service、ingress这些有创建功能的页面，创建时需要选择namespace
    //urlEnvChange 当 env 放生变化时，要把最新的 env 的值给到父组件
    //urlEnvList   当有创建功能的页面，创建时需要选择 env id 数据
    //dataList 父组件传递获取列表的方法，这里去执行
    emits: ['searchChange', 'namespaceChange', 'namespaceList', 'envChange', 'groupChange', 'urlEnvChange', 'dataList', 'addFunc'],
    setup(props, ctx) {
        const searchValue = ref('')
        // 环境
        const enValue = ref('')
        const enList = common.enList
        // 仓库组
        const repoValue = ref('')
        const repoList = common.repoList
        // 环境
        const urlEnvValue = ref('DevOPS')
        const urlEnvList = ref([])

        const urlEnvListData = reactive({
            url: common.urlEnvList,
            params: {
                env_name: '',
                page: 1,
                limit: 10
            }
        })
        //命名空间列表
        const namespaceValue = ref('t1')
        const namespaceList = ref()
        const namespaceListData = reactive({
            url: common.k8sNamespaceList,
            params: {
                cluster: ''
            }
        })

        //【方法】
        function searchChange() {
            ctx.emit('searchChange', searchValue.value)
        }

        function nsChange(val) {
            namespaceValue.value = val
            localStorage.setItem('namespace', val)
            //子传父
            ctx.emit('namespaceChange', val)
            //重新获取一次资源列表
            ctx.emit('dataList')
            //重新获取 role 信息
        }

        function getNamespaceList() {
            namespaceListData.params.cluster = localStorage.getItem('k8s_cluster') || 'TST'
            // namespaceListData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient
                .get(namespaceListData.url, { params: namespaceListData.params })
                .then((res) => {
                    namespaceList.value = res.data.items
                    //父组件要定义namespaceList事件对应的方法，获取到namespaceList.value
                    ctx.emit('namespaceList', namespaceList.value)
                })
                .catch((res) => {
                    message.error(res.msg)
                })
        }

        function enChange(val) {
            enValue.value = val
            localStorage.setItem('en', val)
            //子传父
            ctx.emit('envChange', val)
            //重新获取一次资源列表
            ctx.emit('dataList')
        }

        function repoChange(val) {
            repoValue.value = val
            localStorage.setItem('repo', val)
            //子传父
            ctx.emit('groupChange', val)
            //重新获取一次资源列表
            ctx.emit('dataList')
        }

        async function urlEnvChange(val) {
            urlEnvValue.value = val
            localStorage.setItem('urlEnv', urlEnvValue.value)
            await getEnvList()

            //子传父 重新获取一次资源列表
            ctx.emit('dataList')
        }

        async function getEnvList() {
            await httpClient
                .get(urlEnvListData.url, { params: urlEnvListData.params })
                .then((res) => {
                    urlEnvList.value = res.data.items
                    // 设置 urlEnvID
                    localStorage.setItem('urlEnvID', getIdByName(localStorage.getItem('urlEnv')))
                })
                .catch((res) => {
                    message.error(res.msg)
                })
        }

        function getIdByName(name) {
            const item = urlEnvList.value.find((item) => item.name === name)
            return item ? item.id : '未找到'
        }

        onMounted(() => {
            // if (props.en) {
            //     if (localStorage.getItem('en') != null) {
            //         enChange(localStorage.getItem('en'))
            //     } else {
            //         enChange(enValue.value)
            //     }
            // }
            //第一次进来是default的命名空间，当选了某个命名空间后，切换页面时，命名空间会继承
            if (localStorage.getItem('namespace')) {
                nsChange(localStorage.getItem('namespace'))
            } else {
                nsChange(namespaceValue.value)
            }
            getNamespaceList()

            //切换页面时，url 环境会继承
            if (localStorage.getItem('urlEnv')) {
                urlEnvChange(localStorage.getItem('urlEnv'))
            } else {
                urlEnvChange(urlEnvValue.value)
            }
            getEnvList()
        })
        return {
            namespaceValue,
            namespaceList,
            nsChange,
            enValue,
            enList,
            enChange,
            repoValue,
            repoList,
            repoChange,
            urlEnvValue,
            urlEnvList,
            urlEnvChange,
            searchValue,
            searchChange
        }
    }
}
</script>

<style scoped>
.ant-btn {
    border-radius: 1px;
}
</style>
