<script setup>
import PlatformInfo from './components/PlatformInfo.vue'
import Resource from './components/Resource.vue'
import SearchForm from './components/SearchForm.vue'

import { dayjs } from '@arco-design/web-vue/es/_utils/date'
import { apiGetK8sEvents } from '@/api/kubea/kubea'
import { onMounted, ref } from 'vue'
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()

const query = ref({
    page: 1,
    limit: 10,
    cluster: serviceStore.service.k8s_cluster
})

const tableColumns = ref([
    {
        title: '资源名称',
        dataIndex: 'name'
    },
    {
        title: '资源类型',
        dataIndex: 'kind'
    },
    {
        title: '命名空间',
        dataIndex: 'namespace'
    },
    {
        title: '状态',
        dataIndex: 'rtype'
    },
    {
        title: '原因',
        dataIndex: 'reason'
    },
    {
        title: '描述',
        dataIndex: 'message'
    },
    {
        title: '时间时间',
        dataIndex: 'event_time',
        render: ({ record }) => {
            return record?.event_time ? dayjs(record?.event_time).format('YYYY-MM-DD HH:mm:ss') : ''
        }
    }
])
const tableData = ref([])
const loadTable = ref(true)
const loadSpin = ref(true)

// 获取列表
async function fetchTableList(searchParams = {}) {
    let params = {
        ...query.value,
        ...searchParams
    }
    loadTable.value = true
    const res = await apiGetK8sEvents(params)
    tableData.value = res.data.items || []
    loadTable.value = false
    loadSpin.value = false
}

// 搜索
function handleSearch(params) {
    query.value.page = 1
    fetchTableList(params)
}

onMounted(() => {
    fetchTableList()
})
</script>

<template>
    <a-card>
        <a-spin :loading="loadSpin" style="width: 100%">
            <a-collapse :bordered="false" :default-active-key="['1', '2']" :show-expand-icon="false" expand-icon-position="right">
                <a-collapse-item key="1" header="概览" style="font-size: 18px">
                    <!-- 平台信息 -->
                    <PlatformInfo />
                    <!-- 集群资源信息 -->
                    <Resource />
                </a-collapse-item>

                <a-collapse-item key="2" header="事件" style="font-size: 18px">
                    <!-- 搜索框 -->
                    <SearchForm @search="handleSearch" />
                    <!-- 表格 -->
                    <a-table :columns="tableColumns" :data="tableData" :loading="loadTable" row-key="id"></a-table>
                </a-collapse-item>
            </a-collapse>
        </a-spin>
    </a-card>
</template>
