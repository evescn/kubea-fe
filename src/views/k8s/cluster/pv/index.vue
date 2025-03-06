<script setup>
import { dayjs } from '@arco-design/web-vue/es/_utils/date'
import { ref } from 'vue'
import { apiGetPvsList } from '@/api/kubea/kubea'
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
        title: '容量',
        dataIndex: 'storage',
        slotName: 'storage'
    },
    {
        title: '访问模式',
        dataIndex: 'accessModes',
        slotName: 'accessModes'
    },
    {
        title: '名称空间',
        dataIndex: 'namespace',
        render: ({ record }) => {
            return record.spec.claimRef.namespace
        }
    },
    {
        title: 'PVC',
        dataIndex: 'pvc',
        render: ({ record }) => {
            return record.spec.claimRef.name
        }
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
        width: 200
    }
])
const tableData = ref([])
const loadTable = ref(true)

// 获取列表
async function getPvList() {
    loadTable.value = true
    let params = {
        ...query.value
    }
    const res = await apiGetPvsList(params)
    // debugger
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
</script>

<template>
    <MainHead @dataList="getPvList" @searchChange="handleSearch" />
    <a-card :bodyStyle="{ padding: '10px' }">
        <a-table :columns="tableColumns" :data="tableData" :loading="loadTable" row-key="id" style="font-size: 12px" @change="handleTableChange">
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
                <span :class="[record.status.phase === 'Bound' ? 'success-status' : 'error-status']">{{ record.status.phase }}</span>
            </template>
            <template #time="{ record }">
                <a-tag color="gray">{{ dayjs(record.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss') }}</a-tag>
            </template>
            <template #storage="{ record }">
                <a-tag color="orange">{{ record.spec.capacity.storage }}</a-tag>
            </template>
            <template #accessModes="{ record }">
                <div v-for="(val, key) in record.spec.accessModes" :key="key">
                    <a-tag color="cyan" style="margin-bottom: 5px; cursor: pointer">{{ val }}</a-tag>
                </div>
            </template>
            <!--<template #time="{ record }">-->
            <!--    <a-tag color="gray">{{ dayjs(record.metadata.creationTimestamp).format('YYYY-MM-DD HH:mm:ss') }}</a-tag>-->
            <!--</template>-->
            <template #operate="{ record }">
                <!--<c-button class="namespace-button" type="primary" icon="form-outlined" @click="getNamespaceDetail(record)">YML</c-button>-->
                <!--<c-button style="margin-bottom:5px;" class="namespace-button" type="error" icon="delete-outlined" @click="showConfirm('删除', record.metadata.name, delNamespace)">删除</c-button>-->
            </template>
        </a-table>
    </a-card>
</template>

<style scoped>
.pv-button {
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
