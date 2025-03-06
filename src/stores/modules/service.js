import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGetK8sClusterList, apiGetNameSpacesList } from '@/api/kubea/kubea'

// 数字计数器模块
export const useServiceStore = defineStore('service', () => {
    const service = ref({
        cluster_num: 0,
        en: '',
        k8s_cluster: '',
        namespace: '',
        repo: '',
        urlEnv: 'DevOPS',
        urlEnvID: ''
    })
    const getServiceInfo = async () => {
        const res = await apiGetK8sClusterList()
        service.value.cluster_num = res.data.length
        service.value.k8s_cluster = res.data[0]

        const res2 = await apiGetNameSpacesList({ cluster: service.value.k8s_cluster })
        service.value.namespace = res2.data.items[0].metadata.name
    }
    return {
        service,
        getServiceInfo
    }
})
