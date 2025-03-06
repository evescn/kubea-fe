<script setup>
import { dayjs } from '@arco-design/web-vue/es/_utils/date'
import { ref } from 'vue'
import { apiGetNameSpaceDetail, apiGetNameSpacesList } from '@/api/kubea/kubea'
import { useServiceStore } from '@/stores'
import Model from './components/Model.vue'
import YAML from 'js-yaml'

const serviceStore = useServiceStore()

const query = ref({
    page: 1,
    limit: 10,
    cluster: serviceStore.service.k8s_cluster,
    filter_name: ''
})

const tableColumns = ref([
    {
        title: 'Name',
        dataIndex: 'name',
        slotName: 'name'
    },
    {
        title: '标签',
        dataIndex: 'labels',
        slotName: 'labels'
    },
    {
        title: '状态',
        dataIndex: 'status',
        slotName: 'status'
    },
    {
        title: '创建时间',
        dataIndex: 'creationTimestamp',
        slotName: 'time'
    },
    {
        title: '操作',
        slotName: 'operate',
        align: 'center',
        width: 300
    }
])
const tableData = ref([])
const loadTable = ref(true)

// 获取列表
async function getNamespaceList() {
    loadTable.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetNameSpacesList(params)
    tableData.value = res.data.items || []
    loadTable.value = false
}

// 搜索
function handleSearch(params) {
    query.value.page = 1
    query.value.filter_name = params
}

//截取标签名称
function ellipsis(val, len) {
    return val.length > len ? val.substring(0, len) + '...' : val
}

// YAML
const contentYaml = ref('')
const yamlModelData = ref({
    contentYaml: '',
    yamlModel: false
})

async function getNamespaceDetail(e) {
    let params = {
        cluster: serviceStore.service.k8s_cluster,
        namespace_name: e.metadata.name
    }
    const res = await apiGetNameSpaceDetail(params)
    yamlModelData.value.contentYaml = transYaml(res.data)
    yamlModelData.value.yamlModel = true
}

// json 转 yaml
function transYaml(content) {
    return YAML.dump(content)
}
</script>

<template>
    <MainHead @dataList="getNamespaceList" @searchChange="handleSearch" />
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table
            :columns="tableColumns"
            :data="tableData"
            :loading="loadTable"
            row-key="id"
            style="font-size: 12px"
            @change="handleTableChange"
        >
            <template #name="{ record }">
                <span style="font-weight: bold">{{ record.metadata.name }}</span>
            </template>

            <template #labels="{ record }">
                <div v-for="(val, key) in record.metadata.labels" :key="key">
                    <a-popover>
                        <template #content>
                            <span> {{ key + ': ' + val }}</span>
                        </template>
                        <a-tag color="blue" style="margin-bottom: 3px; cursor: pointer">
                            {{ ellipsis(key + ': ' + val, 15) }}
                        </a-tag>
                    </a-popover>
                </div>
            </template>
            <template #status="{ record }">
                <span :class="[record.status.phase === 'Active' ? 'success-status' : 'error-status']">{{
                    record.status.phase
                }}</span>
            </template>
            <template #time="{ record }">
                <a-tag color="gray">{{ dayjs(record.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss') }}</a-tag>
            </template>
            <template #operate="{ record }">
                <c-button class="namespace-button" icon="icon-edit" type="primary" @click="getNamespaceDetail(record)">
                    YML
                </c-button>
                <c-button
                    class="namespace-button"
                    icon="icon-delete"
                    style="margin-bottom: 5px"
                    type="outline"
                    @click="showConfirm('删除', record.metadata.name, delNamespace)"
                    >删除
                </c-button>
            </template>
        </a-table>
    </a-card>
    <Model v-model="yamlModelData" />
</template>

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
