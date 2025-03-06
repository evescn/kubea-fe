<script setup>
import { onMounted, ref } from 'vue'
import { useServiceStore } from '@/stores'

const serviceStore = useServiceStore()

defineProps({
    namespace: { type: Boolean, default: false },
    en: { type: Boolean, default: false },
    repo: { type: Boolean, default: false },
    urlEnv: { type: Boolean, default: false },
    searchDescribe: { type: String, default: '' },
    add: { type: Boolean, default: false }
})

const emit = defineEmits(['searchChange', 'namespaceChange', 'namespaceList', 'envChange', 'groupChange', 'urlEnvChange', 'dataList', 'addFunc'])

// 搜索
const searchValue = ref('')

function searchChange() {
    emit('searchChange', searchValue.value)
}

// 命名空间列表
const namespaceValue = ref('t1')

function nsChange(val) {
    //子传父
    emit('namespaceChange', val)
    //重新获取一次资源列表
    // emit('dataList')
}

onMounted(() => {
    //重新获取一次资源列表
    emit('dataList')
})
</script>

<template>
    <div>
        <a-card :body-style="{ padding: '10px' }">
            <a-row>
                <a-col :span="20">
                    <div style="text-align: left">
                        <!-- 选择框 -->
                        <!--  K8S集群环境选择框：当收到父组件传过来的namespace属性为true时,才展示这个选择框 -->
                        <span v-if="namespace" style="font-size: 14px">命名空间：</span>
                        <a-select v-if="namespace" placeholder="请选择" show-search size="small" style="width: 140px; margin-right: 20px">
                            <a-select-option></a-select-option>
                        </a-select>
                        <!-- 搜索框 -->
                        <a-input v-model="searchValue" allow-clear placeholder="请输入" size="small" style="width: 200px; margin-right: 10px" @change="searchChange"></a-input>
                        <a-button size="small" type="primary" @click="$emit('dataList')">
                            <template #icon>
                                <icon-search />
                            </template>
                            搜索
                        </a-button>
                    </div>
                </a-col>
                <a-col :span="4">
                    <div style="text-align: right">
                        <a-button v-if="add" size="small" style="margin-right: 10px" type="primary">
                            <template #icon>
                                <icon-plus />
                            </template>
                            新增
                        </a-button>
                        <a-button size="small" @click="$emit('dataList')">
                            <template #icon>
                                <icon-refresh />
                            </template>
                            刷新
                        </a-button>
                    </div>
                </a-col>
            </a-row>
        </a-card>
    </div>
</template>

<style lang="less" scoped></style>
