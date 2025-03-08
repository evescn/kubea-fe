import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiGetK8sClusterList, apiGetNameSpacesList } from '@/api/kubea/kubea'

// 数字计数器模块
export const useServiceStore = defineStore('service', () => {
    const service = ref({
        cluster_num: 0,
        clusterList: [],
        k8s_cluster: '',
        namespace: '',
        namespaceList: [],
        en: '',
        repo: '',
        urlEnv: 'DevOPS',
        urlEnvID: ''
    })
    const getServiceInfo = async () => {
        const res = await apiGetK8sClusterList()
        service.value.clusterList = res.data
        service.value.cluster_num = res.data.length
        service.value.k8s_cluster = res.data[0]

        getNameSpaceInfo()
    }

    const getNameSpaceInfo = async () => {
        const res = await apiGetNameSpacesList({ cluster: service.value.k8s_cluster })
        service.value.namespaceList = res.data.items
        service.value.namespace = res.data.items[0].metadata.name
    }

    const setK8sCluster = (obj) => {
        service.value.k8s_cluster = obj
    }

    const setNameSpace = (obj) => {
        service.value.namespace = obj
    }
    return {
        service,
        getServiceInfo,
        getNameSpaceInfo,
        setK8sCluster,
        setNameSpace
    }
})
