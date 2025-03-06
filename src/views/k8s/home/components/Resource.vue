<script setup>
import { apiGetK8sAllRes } from '@/api/kubea/kubea'
import { onMounted, reactive, ref } from 'vue'

const color = reactive({
    '0%': '#73b9bc',
    '100%': '#109ee9'
    // '0%': 'rgb(var(--primary-6))',
    // '100%': 'rgb(var(--success-6))'
})

const resourceList = ref()

const getK8sAllRes = async () => {
    const res = await apiGetK8sAllRes({
        cluster: 'TST'
    })
    if (res.data) {
        resourceList.value = res.data || []
    }
}

onMounted(() => {
    getK8sAllRes()
})
</script>

<template>
    <a-row :gutter="10">
        <template v-for="(val, key) in resourceList" :key="key">
            <a-col :span="4" style="margin-bottom: 10px">
                <a-card :bodyStyle="{ padding: '10px' }" :bordered="false" style="background-color: rgb(26, 44, 69)">
                    <div style="display: flex; align-items: center; flex-wrap: nowrap">
                        <div style="margin: 15px 10px 0px 10px">
                            <!-- 进度条组件 strokeWidth 是线条的粗细 -->
                            <a-progress :color="color" :percent="100" :show-text="false" :stroke-width="6" :width="40" type="circle"></a-progress>
                        </div>
                        <div style="text-align: center; color: #e1e3e5">
                            <span style="font-size: 14px">{{ key }}</span>
                            <br />
                            <span style="font-size: 30px; font-weight: bold">{{ val }}</span>
                        </div>
                    </div>
                </a-card>
            </a-col>
        </template>
    </a-row>
</template>

<style lang="less" scoped></style>
