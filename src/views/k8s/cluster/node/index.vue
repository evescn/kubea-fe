<script setup>
import { ref } from 'vue'
import { apiGetNodesList } from '@/api/kubea/kubea'
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()

const query = ref({
    page: 1,
    size: 10,
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
        dataIndex: 'standard'
    },
    {
        title: 'POD_CIDR',
        dataIndex: 'podCidr'
    },
    {
        title: '版本',
        dataIndex: 'version'
    },
    {
        title: '创建时间',
        dataIndex: 'creationTimestamp'
    }
])
const tableData = ref([])
const loadTable = ref(true)

// 获取列表
async function getNodeList() {
    loadTable.value = true
    const { size } = query.value
    let params = {
        ...query.value,
        limit: size
    }

    const res = await apiGetNodesList(params)
    tableData.value = res.data.items || []
    loadTable.value = false
}

// 翻页
const onPageChange = ({ page, size }) => {
    Object.assign(query.value, { size, page })
    getNodeList()
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
        <a-table :columns="tableColumns" :dataSource="tableData" :loading="loadTable" :pagination="false" style="font-size: 12px">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'name'">
                    <span style="font-weight: bold">{{ record.metadata.name }}</span>
                    <br />
                    <span style="color: rgb(84, 138, 238)">{{ record.status.addresses[0].address }}</span>
                </template>
                <template v-if="column.dataIndex === 'standard'">
                    <span>{{ record.status.capacity.cpu }}核{{ specTrans(record.status.capacity.memory) }}G</span>
                </template>
                <template v-if="column.dataIndex === 'podCidr'">
                    <a-tag color="geekblue">{{ record.spec.podCIDR }}</a-tag>
                </template>
                <template v-if="column.dataIndex === 'version'">
                    <span style="color: rgb(13, 173, 231)">{{ record.status.nodeInfo.kubeletVersion }} </span>
                </template>
                <template v-if="column.dataIndex === 'creationTimestamp'">
                    <a-tag color="gray">{{ timeDockerTrans(record.metadata.creationTimestamp) }}</a-tag>
                </template>
                <!--<template v-if="column.key === 'action'">-->
                <!--    <c-button-->
                <!--        class="node-button"-->
                <!--        icon="form-outlined"-->
                <!--        style="margin-bottom: 5px"-->
                <!--        type="primary"-->
                <!--        @click="getNodeDetail(record)"-->
                <!--        >YML-->
                <!--    </c-button>-->
                <!--</template>-->
            </template>
            <template #footer>
                <a-row align="center" justify="end">
                    <a-col :span="12">
                        <div class="page-right">
                            <Pager
                                :length="tableData?.length || 0"
                                :loading="loadTable"
                                :pageNum="query.page"
                                :pageSize="query.size"
                                @change="onPageChange"
                            />
                        </div>
                    </a-col>
                </a-row>
            </template>
        </a-table>
    </a-card>
</template>
