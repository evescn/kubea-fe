<template>
    <div>
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            namespace
            @namespaceChange="getNamespaceValue"
            @dataList="getPodList">
        </MainHead>
        <!-- 表格数据 -->
        <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size: 12px;"
                :loading="appLoading"
                :columns="columns"
                :dataSource="podList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex == 'name'">
                        <span style="font-weight: bold">{{ record.metadata.name }}</span>
                    </template>
                    <template v-if="column.dataIndex == 'node'">
                        <span style="color:rgb(84, 138, 238)">{{ record.spec.nodeName }}</span>
                    </template>
                    <template v-if="column.dataIndex == 'state'">
                        <div
                            :class="{'succ-dot':record.status.phase == 'Running',
                            'warn-dot':record.status.phase == 'Pending',
                            'err-dot':record.status.phase != 'Running' && record.status.phase != 'Pending'}"
                            >
                        </div>
                        <span
                            :class="{'succ-state':record.status.phase == 'Running',
                            'warn-state':record.status.phase == 'Pending',
                            'err-status':record.status.phase != 'Running' && record.status.phase != 'Pending'}">
                            {{ record.status.phase }}
                        </span>
                    </template>
                    <template v-if="column.dataIndex == 'restarts'">
                        <span>{{ restartTotal(record) }}</span>
                    </template>
                    <template v-if="column.dataIndex == 'image'">
                        <div v-for="(val, key) in record.spec.containers" :key="key">
                            <a-popover>
                                <template #content>
                                    <span>{{ val.image }}</span>
                                </template>
                                <a-tag style="margin-bottom:5px;cursor:pointer;" color="geekblue">
                                    {{ ellipsis(val.image.split('/').pop() ? val.image.split('/').pop() : val.image, 100 ) }}
                                </a-tag>
                            </a-popover>
                        </div>
                    </template>
                    <template v-if="column.dataIndex == 'creationTimestamp'">
                        <a-tag color="gray">{{ timeTrans(record.metadata.creationTimestamp) }}</a-tag>
                        <!-- <a-tag color="gray">{{ record.metadata.creationTimestamp }}</a-tag> -->
                    </template>
                    <template v-if="column.key === 'action'">
                        <c-button class="pod-button" type="primary" icon="form-outlined" @click="getPodDetail(record)">YML</c-button>
                        <c-button style="margin-bottom:5px;" class="pod-button" type="error" icon="delete-outlined" @click="showConfirm('删除', record.metadata.name, delPod)">删除</c-button>
                        <c-button class="pod-button" type="warning" icon="file-search-outlined" @click="gotoLog(record)">日志</c-button>
                        <c-button class="pod-button" type="warning" icon="code-outlined" @click="gotoTerminal(record)">终端</c-button>
                    </template>
                </template>
            </a-table>
        </a-card>
        <!-- 展示YAMLO信息的弹框 -->
        <a-modal
            v-model:visible="yamlModel"
            title="YAML信息"
            :confirm-loading="appLoading"
            width="945px"
            cancelText="取消"
            okText="更新"
            @ok="updatePod">
            <!-- codemirror 编辑器 -->
            <codemirror
                :value="contentYaml"
                border
                :options="cmOptions"
                height="800"
                width="900"
                style="font-size: 14px;"
                @change="onChange">
            </codemirror>
        </a-modal>
    </div>
</template>

<script>
import { ref, reactive, createVNode } from 'vue'
import common from '@/config'
import httpClient from '@/request'
import { message, Modal } from 'ant-design-vue'
import json2yaml from 'json2yaml'
import yaml2obj from 'js-yaml'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router'

export default ({
    setup() {
        const searchValue = ref('')
        const namespaceValue = ref('')

        //列表数据
        const appLoading = ref(false)
        const columns = ref([
            {
                title: 'POD名',
                dataIndex: 'name',
            },
            {
                title: '节点',
                dataIndex: 'node',
            },
            {
                title: '状态',
                dataIndex: 'state',
                width: 120,
            },
            {
                title: '重启数',
                dataIndex: 'restarts',
            },
            {
                title: '镜像',
                dataIndex: 'image',
            },
            {
                title: '创建时间',
                dataIndex: 'creationTimestamp',
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 200
            }
        ])

        //分页
        const pagination = reactive({
            showSizeChanger: true,
            showQuickJumper: true,
            total: 0,
            current: 1,
            pageSize: 10,
            pageSizeOptions: ['10','20','50','100'],
            showTotal: total => `共 ${total} 条`
        })

        //列表属性
        const podList = ref()
        const podListData = reactive({
            url: common.k8sPodList,
            params: {
                filter_name: '',
                namespace: '',
                cluster: '',
                page: 1,
                limit: 10
            }
        })

        //YAML详情
        const contentYaml = ref('')
        const yamlModel = ref(false)
        const cmOptions = common.cmOptions
        const podDetailData = reactive({
            url: common.k8sPodDetail,
            params: {
                pod_name: '',
                namespace: '',
                cluster: ''
            }
        })

        // 更新
        const updatePodData = reactive({
            url: common.k8sPodUpdate,
            params: {
                content: '',
                namespace: '',
                cluster: ''
            }
        })
        //删除
        const delPodData = reactive({
            url: common.k8sPodDel,
            params: {
                pod_name: '',
                namespace: '',
                cluster: ''
            }
        })
        //router实例
        const router = useRouter()

        //【方法】
        function getSearchValue(val) {
            searchValue.value = val
            pagination.current = 1
        }

        function getNamespaceValue(val) {
            namespaceValue.value = val
            pagination.current = 1
        }
        //处理翻页，pageSize变化
        function handleTableChange(val) {
            pagination.current = val.current
            pagination.pageSize = val.pageSize
            getPodList()
        }
        //获取pod列表
        function getPodList() {
            appLoading.value = true
            podListData.params.filter_name = searchValue.value
            podListData.params.namespace = namespaceValue.value
            podListData.params.cluster = localStorage.getItem('k8s_cluster')
            podListData.params.page = pagination.current
            podListData.params.limit = pagination.pageSize
            httpClient.get(podListData.url, {params: podListData.params})
            .then(res => {
                podList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //获取容器重启次数
        function restartTotal(e) {
            let index, sum = 0
            let containerStatuses = e.status.containerStatuses
            for ( index in containerStatuses) {
                sum = sum + containerStatuses[index].restartCount 
            }
            return sum
        }
        //截取容器名称中前面的镜像仓库地址
        function ellipsis(val, len) {
            return val.length > len ? val.substring(0,len) + '...' : val
        }
        //容器时间调整
        function timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date 
        }
        //yaml 转对象
        function transObj(content) {
            return yaml2obj.load(content)
        }
        // json 转 yaml
        function transYaml(content) {
            return json2yaml.stringify(content)
        }
        //编辑器内容变化时触发的方法，用于将更新的内容复制到变量中
        function onChange(val) {
            contentYaml.value = val
        }
        //获取pod列表详情
        function getPodDetail(e) {
            appLoading.value = true
            podDetailData.params.pod_name = e.metadata.name
            podDetailData.params.namespace = namespaceValue.value
            podDetailData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(podDetailData.url, {params: podDetailData.params})
            .then(res => {
                contentYaml.value = transYaml(res.data)
                yamlModel.value = true
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        //更新pod
        function updatePod() {
            appLoading.value = true
            let content = JSON.stringify(transObj(contentYaml.value))
            updatePodData.params.content = content
            updatePodData.params.namespace = namespaceValue.value
            updatePodData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.put(updatePodData.url, updatePodData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                setTimeout(() => {
                    yamlModel.value = false
                    getPodList()
                    appLoading.value = false
                }, 1000)
            })
        }
        //删除pod
        function delPod(name) {
            appLoading.value = true
            delPodData.params.pod_name = name
            delPodData.params.namespace = namespaceValue.value
            delPodData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.delete(delPodData.url, {data: delPodData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                setTimeout(() => {
                    getPodList()
                    appLoading.value = false
                }, 1000)
                // getPodList()
            })
        }
        //确认框
        //action操作的动作 res操作的资源 fn具体操作的方法
        function showConfirm(action, res, fn){
            Modal.confirm({
                title: '是否继续 ' + action + ' 操作？操作对象：',
                icon: createVNode(ExclamationCircleOutlined),
                content: createVNode('div', {}, res),
                cancelText: '取消',
                okText: '确认',
                onOk() {
                    fn(res)
                },
            })
        }
        //跳转日志页
        function gotoLog(e) {
            let routeUrl = router.resolve({
                path: "/workload/pod/log",
                query: {
                    pod_name: e.metadata.name,
                    namespace: e.metadata.namespace,
                    cluster: localStorage.getItem('k8s_cluster')
                }
            })
            window.open(routeUrl.href, '_blank')
        }
        //跳转终端页
        function gotoTerminal(record) {
            let routeUrl = router.resolve({
                path: "/workload/pod/terminal",
                query: {
                    pod_name: record.metadata.name,
                    namespace: record.metadata.namespace,
                    cluster: localStorage.getItem('k8s_cluster')
                }
            })
            window.open(routeUrl.href, '_blank')
        }
        
        return {
            getSearchValue,
            getNamespaceValue,
            getPodList,
            appLoading,
            columns,
            pagination,
            podList,
            handleTableChange,
            restartTotal,
            ellipsis,
            timeTrans,
            getPodDetail,
            yamlModel,
            updatePod,
            contentYaml,
            cmOptions,
            onChange,
            delPod,
            showConfirm,
            gotoLog,
            gotoTerminal,
        }
    }
})
</script>

<style scoped>
    .pod-button {
        margin-right: 5px;
    }
    .ant-btn {
        border-radius: 1px;
    }
    .succ-dot{
        display:inline-block;
        width: 7px;
        height:7px;
        background:#86c169;
        border-radius:50%;
        border:1px solid #88c06c;
        margin-right: 10px;
    }
    .warn-dot{
        display:inline-block;
        width: 7px;
        height:7px;
        background: rgb(233, 200, 16);
        border-radius:50%;
        border:1px solid rgb(233, 200, 16);
        margin-right: 10px;
    }
    .err-dot{
        display:inline-block;
        width: 7px;
        height:7px;
        background:rgb(199, 85, 85);
        border-radius:50%;
        border:1px solid rgb(207, 94, 94);
        margin-right: 10px;
    }
    .succ-state {
        color: rgb(27, 202, 21);
    }
    .warn-state {
        color: rgb(233, 200, 16);
    }
    .err-state {
        color: rgb(226, 23, 23);
    }
</style>

