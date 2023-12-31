<template>
    <div>
        <MainHead
            searchDescribe="请输入"
            @searchChange="getSearchValue"
            @dataList="getNamespaceList">
        </MainHead>
        <!-- 表格数据 -->
        <a-card :bodyStyle="{padding: '10px'}">
            <a-table
                style="font-size: 12px;"
                :loading="appLoading"
                :columns="columns"
                :dataSource="namespaceList"
                :pagination="pagination"
                @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex == 'name'">
                        <span style="font-weight: bold">{{ record.metadata.name }}</span>
                    </template>
                    <template v-if="column.dataIndex === 'labels'">
                        <div v-for="val, key in record.metadata.labels" :key="key">
                            <a-popover>
                                <template #content>
                                    <span> {{ key + ": " + val }}</span>
                                </template>
                                <a-tag style="margin-bottom:3px; cursor:pointer;" color="blue">{{ ellipsis(key + ": " + val, 15) }}</a-tag>
                            </a-popover>
                        </div>
                    </template>
                    <template v-if="column.dataIndex === 'status'">
                        <span :class="[record.status.phase === 'Active' ? 'success-status' : 'error-status']">{{ record.status.phase }}</span>
                    </template>
                    <template v-if="column.dataIndex == 'creationTimestamp'">
                        <a-tag color="gray">{{ timeTrans(record.metadata.creationTimestamp) }}</a-tag>
                        <!-- <a-tag color="gray">{{ record.metadata.creationTimestamp }}</a-tag> -->
                    </template>
                    <template v-if="column.key === 'action'">
                        <c-button class="namespace-button" type="primary" icon="form-outlined" @click="getNamespaceDetail(record)">YML</c-button>
                        <c-button style="margin-bottom:5px;" class="namespace-button" type="error" icon="delete-outlined" @click="showConfirm('删除', record.metadata.name, delNamespace)">删除</c-button>
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
            @ok="updateNamespace">
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

export default ({
    setup() {
        const searchValue = ref('')

        //列表数据
        const appLoading = ref(false)
        const columns = ref([
            {
                title: 'Namespace名',
                dataIndex: 'name'
            },
            {
                title: '标签',
                dataIndex: 'labels'
            },
            {
                title: '状态',
                dataIndex: 'status',
            },
            {
                title: '创建时间',
                dataIndex: 'creationTimestamp'
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
        const namespaceList = ref()
        const namespaceListData = reactive({
            url: common.k8sNamespaceList,
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
        const namespaceDetailData = reactive({
            url: common.k8sNamespaceDetail,
            params: {
                ds_name: '',
                namespace: '',
                cluster: ''
            }
        })

        // 更新
        const updateNamespaceData = reactive({
            url: common.k8sNamespaceUpdate,
            params: {
                content: '',
                namespace: '',
                cluster: ''
            }
        })
        //删除
        const delNamespaceData = reactive({
            url: common.k8sNamespaceDel,
            params: {
                ds_name: '',
                namespace: '',
                cluster: ''
            }
        })


        //【方法】
        function getSearchValue(val) {
            searchValue.value = val
            pagination.current = 1
        }
        //处理翻页，pageSize变化
        function handleTableChange(val) {
            pagination.current = val.current
            pagination.pageSize = val.pageSize
            getNamespaceList()
        }
        //获取Namespace列表
        function getNamespaceList() {
            appLoading.value = true
            namespaceListData.params.filter_name = searchValue.value
            namespaceListData.params.cluster = localStorage.getItem('k8s_cluster')
            namespaceListData.params.page = pagination.current
            namespaceListData.params.limit = pagination.pageSize
            httpClient.get(namespaceListData.url, {params: namespaceListData.params})
            .then(res => {
                namespaceList.value = res.data.items
                pagination.total = res.data.total
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                appLoading.value = false
            })
        }
        // json 转 yaml
        function transYaml(content) {
            return json2yaml.stringify(content)
        }
        //yaml 转对象
        function transObj(content) {
            return yaml2obj.load(content)
        }
        //容器时间调整
        function timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date 
        }
        //截取标签名称
        function ellipsis (val, len) {
            return val.length > len ? val.substring(0,len) + '...' : val
        }
        //编辑器内容变化时触发的方法，用于将更新的内容复制到变量中
        function onChange(val) {
            contentYaml.value = val
        }
        //获取pod列表详情
        function getNamespaceDetail(e) {
            appLoading.value = true
            namespaceDetailData.params.namespace_name = e.metadata.name
            namespaceDetailData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.get(namespaceDetailData.url, {params: namespaceDetailData.params})
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
        function updateNamespace() {
            appLoading.value = true
            let content = JSON.stringify(transObj(contentYaml.value))
            updateNamespaceData.params.content = content
            updateNamespaceData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.put(updateNamespaceData.url, updateNamespaceData.params)
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                setTimeout(() => {
                    yamlModel.value = false
                    getNamespaceList()
                    appLoading.value = false
                }, 1000)
            })
        }
        //删除pod
        function delNamespace(name) {
            appLoading.value = true
            delNamespaceData.params.namespace_name = name
            delNamespaceData.params.cluster = localStorage.getItem('k8s_cluster')
            httpClient.delete(delNamespaceData.url, {data: delNamespaceData.params})
            .then(res => {
                message.success(res.msg)
            })
            .catch(res => {
                message.error(res.msg)
            })
            .finally(() => {
                setTimeout(() => {
                    getNamespaceList()
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

        return {
            getSearchValue,
            getNamespaceList,
            appLoading,
            columns,
            namespaceList,
            pagination,
            handleTableChange,
            ellipsis,
            transObj,
            transYaml,
            timeTrans,
            getNamespaceDetail,
            showConfirm,
            delNamespace,
            yamlModel,
            updateNamespace,
            contentYaml,
            cmOptions,
            onChange,
        }
    }
})
</script>


<style scoped>
    .namespace-button {
        margin-right: 5px;
    }
    .ant-form-item {
        margin-bottom: 20px;
    }
    .success-status {
        color: rgb(27, 202, 21);
    }
    .warning-status {
        color: rgb(233, 200, 16);
    }
    .error-status {
        color: rgb(226, 23, 23);
    }
</style>