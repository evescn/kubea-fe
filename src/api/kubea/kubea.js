import request from '@/utils/request'

// k8s all res 接口
export function apiGetK8sAllRes(params) {
    return request.get(`/api/k8s/allres`, { params: params })
}

// events 事件
export function apiGetK8sEvents(params) {
    return request.get(`/api/k8s/events`, { params: params })
}

// cluster list
export function apiGetK8sClusterList(params) {
    return request.get(`/api/k8s/clusters`, { params: params })
}

// node
export function apiGetNodesList(params) {
    return request.get(`/api/k8s/nodes`, { params: params })
}

//     k8sNodeDetail: baseHost + '/api/k8s/node/detail',

// namespace
export function apiGetNameSpacesList(params) {
    return request.get(`/api/k8s/namespaces`, { params: params })
}

export function apiGetNameSpaceDetail(params) {
    return request.get(`/api/k8s/namespace/detail`, { params: params })
}

export function apiUpdateNameSpace(params) {
    return request.put(`/api/k8s/namespace`, params)
}

// k8sNamespaceDel: baseHost + '/api/k8s/namespace',

// pv
export function apiGetPvsList(params) {
    return request.get(`/api/k8s/pvs`, { params: params })
}

// k8sPvDetail: baseHost + '/api/k8s/pv/detail',
// k8sPvDel: baseHost + '/api/k8s/pv',

// pod
export function apiGetPodsList(params) {
    return request.get(`/api/k8s/pods`, { params: params })
}

export function apiGetPodDetail(params) {
    return request.get(`/api/k8s/pod/detail`, { params: params })
}

export function apiUpdatePod(params) {
    return request.put(`/api/k8s/pod`, params)
}

export function apiDelPod(params) {
    return request.delete(`/api/k8s/pod`, { data: params })
}

export function apiGetPodContainer(params) {
    return request.get(`/api/k8s/pod/container`, { params: params })
}

export function apiGetPodLog(params) {
    return request.get(`/api/k8s/pod/log`, { params: params })
}

// k8sPodNumNp: baseHost + '/api/k8s/pod/numnp',
// k8sTerminalWs: wsHost + '/ws',
