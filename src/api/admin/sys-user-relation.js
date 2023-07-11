import request from '@/utils/request'

// 查询SysUserRelation列表
export function listSysUserRelation(query) {
    return request({
        url: '/api/v1/sys-user-relation',
        method: 'get',
        params: query
    })
}

// 查询SysUserRelation详细
export function getSysUserRelation (id) {
    return request({
        url: '/api/v1/sys-user-relation/' + id,
        method: 'get'
    })
}


// 新增SysUserRelation
export function addSysUserRelation(data) {
    return request({
        url: '/api/v1/sys-user-relation',
        method: 'post',
        data: data
    })
}

// 修改SysUserRelation
export function updateSysUserRelation(data) {
    return request({
        url: '/api/v1/sys-user-relation/'+data.id,
        method: 'put',
        data: data
    })
}

// 删除SysUserRelation
export function delSysUserRelation(data) {
    return request({
        url: '/api/v1/sys-user-relation',
        method: 'delete',
        data: data
    })
}

