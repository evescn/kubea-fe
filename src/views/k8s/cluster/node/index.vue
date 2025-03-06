<script setup>
import { ref } from 'vue'
import { apiGetNodesList } from '@/api/kubea/kubea'
import { dayjs } from '@arco-design/web-vue/es/_utils/date'
import { useServiceStore } from '@/stores'

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
        title: '规格',
        dataIndex: 'standard',
        render: ({ record }) => {
            return record.status.capacity.cpu + '核' + specTrans(record.status.capacity.memory) + 'G'
        }
    },
    {
        title: 'POD_CIDR',
        dataIndex: 'podCIDR',
        slotName: 'podCIDR'
    },
    {
        title: 'Version',
        dataIndex: 'version',
        slotName: 'version'
    },
    {
        title: '创建时间',
        dataIndex: 'creationTimestamp',
        slotName: 'time'
    }
])
const tableData = ref([])
const loadTable = ref(true)

// 获取列表
async function getNodeList() {
    loadTable.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetNodesList(params)
    tableData.value = res.data.items || []
    loadTable.value = false
}

// 搜索
function handleSearch(params) {
    query.value.page = 1
    query.value.filter_name = params
}

function specTrans(str) {
    if (str.indexOf('Ki') === -1) {
        return str
    }
    let num = str.slice(0, -2) / 1000 / 1000
    return num.toFixed(0)
}
</script>

<template>
    <MainHead @dataList="getNodeList" @searchChange="handleSearch" />
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="tableColumns" :data="tableData" :loading="loadTable" row-key="id" style="font-size: 12px" @change="handleTableChange">
            <template #name="{ record }">
                <span style="font-weight: bold">{{ record.metadata.name }}</span>
                <br />
                <span style="color: rgb(84, 138, 238)">{{ record.status.addresses[0].address }}</span>
            </template>
            <template #podCIDR="{ record }">
                <a-tag color="blue">{{ record.spec.podCIDR }}</a-tag>
            </template>
            <template #version="{ record }">
                <span style="color: rgb(13, 173, 231)">{{ record.status.nodeInfo.kubeletVersion }} </span>
            </template>

            <template #time="{ record }">
                <a-tag color="gray">{{ dayjs(record.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss') }}</a-tag>
            </template>
        </a-table>
    </a-card>
</template>
