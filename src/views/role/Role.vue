<template>

    <MainHead
        searchDescribe="请输入"
        @searchChange="getSearchValue"
        @dataList="getRoleList"
        add
        @addFunc="handleOpenForm('create')" />
    <!-- 表格数据 -->
    <a-card :bodyStyle="{padding: '10px'}">
        <a-table
            style="font-size: 12px"
            :loading="appLoading"
            :columns="columns"
            :dataSource="roleList"
            :pagination="pagination"
            @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'role_name'">
                    <span v-if="record.role_name === `超级管理员` " style="color: rgb(84, 138, 238);">{{ record.role_name }}</span>
                    <span v-else-if="record.role_name === `开发用户`" style="color: rgb(185,117,76);">{{ record.role_name }}</span>
                    <span v-else-if="record.role_name === `测试用户`" style="color: rgb(168,104,204);">{{ record.role_name }}</span>
                    <span v-else-if="record.role_name === `运维用户`" style="color: rgb(102,166,92);">{{ record.role_name }}</span>
                </template>
                <template v-if="column.dataIndex === 'description'">
                    <span style="font-weight: bold; color: rgb(98,199,191);">{{ record.description }}</span>
                </template>
                <template v-if="column.dataIndex === 'CreatedAt'">
                    <a-tag color="gray">{{ timeTrans(record.CreatedAt) }}</a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-button size="small" type="link" @click="handleOpenForm('update', record)">编辑</a-button>
                    <a-button size="small" type="link" @click="showConfirm('删除', record, delRoleFunc)">删除</a-button>
                </template>
            </template>
        </a-table>
    </a-card>
    <!-- 编辑应用表单 -->
    <a-drawer
        v-model:visible="updateDrawer"
        title="编辑应用"
        :footer-style="{textAlign: 'right'}"
        @close="onClose('update')">
        <br>
        <a-form ref="updateRef" :model="updateRole" :labelCol="{style: {width: '30%'}}">
            <a-form-item
                label="角色名"
                name="role_name"
                :rules="[{ required: true, message: '请输入角色名'}]">
                <a-input v-model:value="updateRole.role_name"></a-input>
            </a-form-item>
            <a-form-item
                label="描述"
                name="description"
                :rules="[{ required: true, message: '请输入应用描述' }]">
                <a-textarea show-count :maxlength="20" v-model:value="updateRole.description"/>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button style="margin-right: 8px" @click="onClose('update')">取消</a-button>
            <a-button type="primary" @click="formSubmit('update')">更新</a-button>
        </template>
    </a-drawer>
    <!-- 新增应用表单 -->
    <a-drawer
        v-model:visible="createDrawer"
        title="新增应用"
        :footer-style="{textAlign: 'right'}"
        @close="onClose('create')">
        <br>
        <a-form ref="createRef" :model="createRole" :labelCol="{style: {width: '30%'}}">
            <a-form-item
                label="角色名"
                name="role_name"
                :rules="[{ required: true, message: '请输入角色名'}]">
                <a-input v-model:value="createRole.role_name"></a-input>
            </a-form-item>
            <a-form-item
                label="描述"
                name="description"
                :rules="[{ required: true, message: '请输入应用描述' }]">
                <a-textarea show-count :maxlength="20" v-model:value="createRole.description"/>
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button style="margin-right: 8px" @click="onClose('create')">取消</a-button>
            <a-button type="primary" @click="formSubmit('create')">新增</a-button>
        </template>
    </a-drawer>
</template>

<script>
import {ref, reactive, createVNode} from 'vue'
import common from '@/config'
import httpClient from '@/request'
import {message, Modal} from 'ant-design-vue'
import {ExclamationCircleOutlined} from '@ant-design/icons-vue';

export default ({
    setup() {
        //常用项
        const searchValue = ref('')
        const appLoading = ref(false)

        // 表格列
        const columns = ref([
            {
                title: 'ID',
                dataIndex: 'id'
            },
            {
                title: '角色',
                dataIndex: 'role_name'
            },
            {
                title: '描述',
                dataIndex: 'description'
            },
            {
                title: '创建时间',
                dataIndex: 'CreatedAt'
            },
            {
                title: '操作',
                key: 'action',
                fixed: 'right',
                align: 'center',
                width: 150
            }
        ])
        //分页
        const pagination = reactive({
            showSizeChanger: true,
            showQuickJumper: true,
            total: 0,
            current: 1,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: total => `共 ${total} 条`
        })
        //列表属性
        const roleList = ref([])
        const roleListData = reactive({
            url: common.roleList,
            params: {
                role_name: '',
                page: 1,
                limit: 10
            }
        })

        //更新
        const updateRef = ref()
        const updateDrawer = ref(false)
        const updateRole = reactive({
            id: 0,
            role_name: '',
            description: ''
        })
        const updateRoleData = reactive({
            url: common.roleUpdate,
            params: {}
        })

        //新增
        const createRef = ref()
        const createDrawer = ref(false)
        const createRole = reactive({
            role_name: '',
            description: ''
        })
        const createRoleData = reactive({
            url: common.roleAdd,
            params: {}
        })

        //删除
        const delRoleData = reactive({
            url: common.roleDel,
            params: {
                id: '',
            }
        })

        //【方法】
        function getSearchValue(val) {
            searchValue.value = val
            pagination.current = 1
        }

        //处理翻页，pageSize变化
        function handleTableChange(val) {
            pagination.current = val.current
            pagination.pageSize = val.pageSize
            getRoleList()
        }

        //时间调整
        function timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON();
            date = date.substring(0, 19).replace('T', ' ')
            return date
        }

        function getRoleList() {
            appLoading.value = true
            roleListData.params.role_name = searchValue.value
            roleListData.params.page = pagination.current
            roleListData.params.limit = pagination.pageSize
            httpClient.get(roleListData.url, {params: roleListData.params})
                .then(res => {
                    roleList.value = res.data.items
                    pagination.total = res.data.total
                })
                .catch(res => {
                    message.error(res.msg)
                })
                .finally(() => {
                    appLoading.value = false
                })
        }

        function handleOpenForm(val, row) {
            switch (val) {
                case "create":
                    createDrawer.value = true
                    break
                case "update":
                    updateRole.id = row.id
                    updateRole.role_name = row.role_name
                    updateRole.description = row.description
                    updateDrawer.value = true
                    break
            }
        }

        //编辑
        function updateRoleFunc() {
            appLoading.value = true
            httpClient.put(updateRoleData.url, updateRole)
                .then(res => {
                    message.success(res.msg)
                })
                .catch(res => {
                    message.error(res.msg)
                })
                .finally(() => {
                    //重置表单
                    resetForm('update')
                    getRoleList()
                    //关闭抽屉
                    updateDrawer.value = false
                })
        }

        //新增
        function createRoleFunc() {
            appLoading.value = true
            httpClient.post(createRoleData.url, createRole)
                .then(res => {
                    message.success(res.msg)
                })
                .catch(res => {
                    message.error(res.msg)
                })
                .finally(() => {
                    //重置表单
                    resetForm('create')
                    getRoleList()
                    //关闭抽屉
                    createDrawer.value = false
                })
        }

        //更新按钮
        async function formSubmit(val) {
            try {
                switch (val) {
                    case "create":
                        await createRef.value.validateFields();
                        createRoleFunc()
                        break
                    case "update":
                        await updateRef.value.validateFields();
                        updateRoleFunc()
                        break
                }
            } catch (errorInfo) {
                console.log("Failed: ", errorInfo)
            }
        }

        //删除Deployment
        function delRoleFunc(row) {
            appLoading.value = true
            delRoleData.params.id = row.id
            httpClient.delete(delRoleData.url, {data: delRoleData.params})
                .then(res => {
                    message.success(res.msg)
                })
                .catch(res => {
                    message.error(res.msg)
                })
                .finally(() => {
                    getRoleList()
                    //关闭抽屉
                    appLoading.value = false
                })
        }
        //确认框
        //action操作的动作 res操作的资源 fn具体操作的方法
        function showConfirm(action, res, fn){
            Modal.confirm({
                title: '是否继续 ' + action + ' 操作？操作对象：',
                icon: createVNode(ExclamationCircleOutlined),
                content: createVNode('div', {}, res),
                cancelText: '取消',
                okText: '确认',
                onOk() {
                    fn(res)
                },
            })
        }
        function resetForm(val) {
            switch (val) {
                case "create":
                    createRef.value.resetFields()
                    break
                case "update":
                    updateRef.value.resetFields()
                    break
            }
        }
        //关闭抽屉
        function onClose (val) {
            Modal.confirm({
                title: "是否确认关闭操作? ",
                icon: createVNode(ExclamationCircleOutlined),
                content: createVNode('div', {
                    style: 'color:red;',
                }),
                cancelText: '取消',
                okText: '确认',
                onOk() {
                    createDrawer.value = false
                    updateDrawer.value = false
                    resetForm(val)
                },
                onCancel() {
                    switch (val) {
                        case "create":
                            createDrawer.value = true
                            updateDrawer.value = false
                            break
                        case "update":
                            createDrawer.value = false
                            updateDrawer.value = true
                            break
                    }
                }
            })
        }

        // 返回数据
        return {
            appLoading,
            columns,
            getSearchValue,
            handleTableChange,
            getRoleList,
            timeTrans,
            roleList,
            pagination,
            handleOpenForm,
            showConfirm,
            updateRef,
            updateDrawer,
            updateRole,
            formSubmit,
            onClose,
            delRoleFunc,
            createRef,
            createDrawer,
            createRole,

        }
    }
})
</script>