<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-row :gutter="20">
          <!--用户数据-->
          <el-col :span="24" :xs="24">
            <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
              <el-form-item label="用户名称" prop="username">
                <el-input
                  v-model="queryParams.username"
                  placeholder="请输入用户名称"
                  clearable
                  size="small"
                  style="width: 160px"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="queryParams.phone"
                  placeholder="请输入手机号码"
                  clearable
                  size="small"
                  style="width: 160px"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="queryParams.status"
                  placeholder="用户状态"
                  clearable
                  size="small"
                  style="width: 160px"
                >
                  <el-option
                    v-for="dict in statusOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:add']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleAdd"
                >新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:edit']"
                  type="success"
                  icon="el-icon-edit"
                  size="mini"
                  @click="handleUpdate"
                >修改</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysUser:remove']"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="multiple"
                  @click="handleDelete"
                >删除</el-button>
              </el-col>
            </el-row>

            <el-table
              v-loading="loading"
              :data="userList"
              border
              @selection-change="handleSelectionChange"
              @sort-change="handleSortChang"
            >
              <el-table-column type="selection" width="45" align="center" />
              <el-table-column label="编号" width="75" prop="userId" sortable="custom" />
              <el-table-column label="登录名" width="105" prop="username" sortable="custom" :show-overflow-tooltip="true" />
              <el-table-column label="昵称" prop="nickName" :show-overflow-tooltip="true" />
              <!-- <el-table-column label="部门" prop="dept.deptName" :show-overflow-tooltip="true" /> -->
              <el-table-column label="手机号" prop="phone" width="108" />
              <el-table-column label="状态" width="80" sortable="custom">
                <template slot-scope="scope">
                  <el-switch
                    v-model="scope.row.status"
                    active-value="2"
                    inactive-value="1"
                    @change="handleStatusChange(scope.row)"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="创建时间"
                prop="createdAt"
                sortable="custom"
                width="155"
              >
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.createdAt) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="160"

                fix="right"
                class-name="small-padding fixed-width"
              >
                <template slot-scope="scope">
                  <el-button
                    v-permisaction="['admin:sysUser:edit']"
                    size="mini"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdate(scope.row)"
                  >修改</el-button>
                  <el-button
                    v-if="scope.row.userId !== 1"
                    v-permisaction="['admin:sysUser:remove']"
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleDelete(scope.row)"
                  >删除</el-button>
                  <el-button
                    v-permisaction="['admin:sysUser:resetPassword']"
                    size="mini"
                    type="text"
                    icon="el-icon-key"
                    @click="handleResetPwd(scope.row)"
                  >重置</el-button>
                </template>
              </el-table-column>
            </el-table>

            <pagination
              v-show="total>0"
              :total="total"
              :page.sync="queryParams.pageIndex"
              :limit.sync="queryParams.pageSize"
              @pagination="getList"
            />
          </el-col>
        </el-row>
      </el-card>
      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="登录账号" prop="username">
                <el-input v-model="form.username" placeholder="请输入登录账号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="form.userId == undefined" label="登录密码" prop="password">
                <el-input v-model="form.password" placeholder="请输入登录密码" type="password" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户昵称" prop="nickName">
                <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户性别">
                <el-select v-model="form.sex" placeholder="请选择">
                  <el-option
                    v-for="dict in sexOptions"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birthday">
                <el-date-picker
                  v-model="form.birthday"
                  type="datetime"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  :style="{width: '100%'}"
                  placeholder="请选择日期"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="数字生命" prop="digitalLife">
                <el-upload
                  :file-list="digitalLifeFileList"
                  :on-remove="handleRemove"
                  :on-success="handleUploadSuccess"
                  :on-preview="handlePreview"
                  :action="digitalLifeAction"
                >
                  <el-button size="small" type="primary" icon="el-icon-upload">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col v-model="form.infoList" :span="24" label-width="auto">
              <div v-for="(item, index) in form.infoList" :key="index">
                <el-form-item label="关系" class="el-col-8" style="margin-left: 10px;">
                  <el-select
                    v-model="item.relationOptions"
                    clearable
                    placeholder="Select"
                    filterable
                    allow-create
                    collapse-tags-tooltip
                    default-first-option
                    :reserve-keyword="false"
                  >
                    <el-option v-for="(r, i) in relationOptions" :key="i" :label="r.title" :value="r.id" />
                  </el-select>
                </el-form-item>
                <el-form-item label="选择用户" class="el-col-8" style="margin-left: 10px;">
                  <el-select
                    v-model="item.userListOptions"
                    placeholder="Select"
                    collapse-tags
                    allow-create
                    collapse-tags-tooltip
                    filterable
                    default-first-option
                    :reserve-keyword="false"
                  >
                    <el-option v-for="(uv, ui) in userListOptions" :key="ui" :label="uv.username" :value="uv.userId" />
                  </el-select>
                </el-form-item>
                <el-form-item class="el-col-4" style="width:auto;">
                  <el-button @click="addItem()"> + </el-button>
                  <el-button @click="deleteItem(index)"> – </el-button>
                </el-form-item>
              </div>
            </el-col>
            <el-col :span="24">
              <el-form-item label="常住地址" prop="address">
                <el-input v-model="form.address" placeholder="请输入常住地址" clearable :style="{width: '100%'}" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio
                    v-for="dict in statusOptions"
                    :key="dict.value"
                    :label="dict.value"
                  >{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色">
                <el-select v-model="form.roleId" placeholder="请选择" @change="$forceUpdate()">
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                    :disabled="item.status == 1"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" :close-on-click-modal="false">
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">
            <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
          </div>
          <div slot="tip" class="el-upload__tip" style="color:red">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </el-dialog>
    </template>
  </BasicLayout>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, exportUser, resetUserPwd, changeUserStatus, importTemplate } from '@/api/admin/sys-user'
import { getToken } from '@/utils/auth'

import { listPost } from '@/api/admin/sys-post'
import { listRole } from '@/api/admin/sys-role'
import { treeselect } from '@/api/admin/sys-dept'
import { listSysUserRelation } from '@/api/admin/sys-user-relation'
import { request } from '@/utils/request'

// import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SysUserManage',
  // components: { Treeselect },
  data() {
    return {
      infoList: [{ relationOptions: 1, userListOptions: '' }],
      relationOptions: [],
      userListOptions: [],
      digitalLifeFileList: [],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 数字生命
      digitalLife: null,
      // 弹出层标题
      title: '',
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 出生日期
      birthday: undefined,
      // 常住地址
      address: undefined,
      // 默认密码
      initPassword: '',
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {
        digitalLifeFileList: []
      },
      digitalLifeAction: process.env.VUE_APP_BASE_API + '/api/v1/public/upload',
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/system/user/importData'
      },
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10,
        username: undefined,
        phone: undefined,
        status: undefined,
        deptId: undefined
      },
      // 表单校验
      rules: {
        username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        // deptId: [{ required: true, message: '归属部门不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
        infoList:[{ required: true,trigger: 'blur' }],
        email: [
          // { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          { type: 'email', message: "'请输入正确的邮箱地址", trigger: ['blur', 'change'] }
        ],
        phone: [
          // { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.getList()
    this.getTreeselect()
    this.getUserList()
    this.getSysUserRelation()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then(response => {
      this.sexOptions = response.data
    })
    this.getConfigKey('sys_user_initPassword').then(response => {
      this.initPassword = response.data.configValue
    })
  },
  methods: {
    // 删除上传的图片
    handleRemove(file, fileList) {
      this.form.digitalLifeFileList = []
      fileList.forEach(file => {
        var obj = {}
        this.$set(obj, 'name', file.name);
        this.$set(obj, 'url', file.url);
        this.form.digitalLifeFileList.push(obj)
      })
    },
    // 上传文件成功
    handleUploadSuccess(response, file, fileList) {
      if (response.code !== 200) {
        this.$message.error('上传失败！')
      }

      //修改展示名称
      fileList[fileList.length-1].name = response.data
      fileList[fileList.length-1].url = response.data
      
      this.form.digitalLifeFileList = []
      fileList.forEach(file => {
        var obj = {}
        this.$set(obj, 'name', file.name);
        this.$set(obj, 'url', file.url);
        this.form.digitalLifeFileList.push(obj)
      })
      console.log(response, file, fileList)
    },
    //点击文件列表中已上传的文件时的钩子,进行下载
    handlePreview(file) {
		      var link = document.createElement("a"); //定义一个a标签
          link.target = "_blank"
		      link.download = file.name; //下载后的文件名称
		      link.href = process.env.VUE_APP_BASE_API+"/"+file.url; //需要生成一个 URL 来实现下载
		      link.click(); //模拟在按钮上实现一次鼠标点击
		      window.URL.revokeObjectURL(link.href);
    },
    // 新增任务分配
    addItem() {
      const that = this
      that.form.infoList.push({
        relationOptions: '',
        userListOptions: ''
      })
    },
    deleteItem(i) {
      if (this.form.infoList.length <= 1) {
        return false
      }
      this.form.infoList.splice(i, 1)
    },
    /** 查询用户列表 */
    getList() {
      this.loading = true
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.userList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    /** 查询用户列表选项列表 */
    getUserList() {
      this.loading = true
      listUser(this.addDateRange({
        pageIndex: 1,
        pageSize: 10000
      })).then(response => {
        this.userListOptions = response.data.list
      }
      )
    },
    /** 查询关系下拉树结构 */
    getSysUserRelation() {
      listSysUserRelation().then(response => {
        this.relationOptions = response.data.list
      })
    },

    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = '/' + data.id + '/'
      this.getList()
    },
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.label,
        children: node.children
      }
    },
    /** 排序回调函数 */
    handleSortChang(column, prop, order) {
      prop = column.prop
      order = column.order
      if (this.order !== '' && this.order !== prop + 'Order') {
        this.queryParams[this.order] = undefined
      }
      if (order === 'descending') {
        this.queryParams[prop + 'Order'] = 'desc'
        this.order = prop + 'Order'
      } else if (order === 'ascending') {
        this.queryParams[prop + 'Order'] = 'asc'
        this.order = prop + 'Order'
      } else {
        this.queryParams[prop + 'Order'] = undefined
      }
      this.getList()
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.status === '2' ? '启用' : '停用'
      this.$confirm('确认要"' + text + '""' + row.username + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeUserStatus(row)
      }).then(() => {
        this.msgSuccess(text + '成功')
      }).catch(function() {
        row.status = row.status === '2' ? '1' : '2'
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        username: undefined,
        nickName: undefined,
        password: undefined,
        address: undefined,
        birthday: undefined,
        phone: undefined,
        email: undefined,
        sex: '2',
        status: '2',
        remark: undefined,
        postIds: undefined,
        roleIds: undefined,
        infoList: [{ relationOptions: undefined, userListOptions: undefined }],
        digitalLifeFileList: []
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.deptId = ''
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getTreeselect()
      this.getUserList()
      this.getSysUserRelation()

      listPost({ pageSize: 1000 }).then(response => {
        this.postOptions = response.data.list
      })
      listRole({ pageSize: 1000 }).then(response => {
        this.roleOptions = response.data.list
      })
      this.open = true
      this.title = '添加用户'
      this.form.password = this.initPassword
      this.form.roleId = 2
      this.form.digitalLifeFileList = []
      this.form.infoList = [{ relationOptions: undefined, userListOptions: undefined }]
      this.digitalLifeFileList = []
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getTreeselect()
      this.getUserList()
      this.getSysUserRelation()
      this.form.digitalLifeFileList = []
      this.form.infoList = []
      this.digitalLifeFileList = []

      const userId = row.userId || this.ids
      getUser(userId).then(response => {
        const digitalLifeFileList = []
        this.form = response.data
        var tempList = JSON.parse(response.data.digital_life)
        tempList.forEach( temp => {
          var obj = {}
          this.$set(obj, 'name', temp);
          this.$set(obj, 'url', temp);
          digitalLifeFileList.push(obj)
        });

        this.digitalLifeFileList = this.form.digitalLifeFileList = digitalLifeFileList
        this.open = true
        this.title = '修改用户'
        this.form.password = ''
      })
      listPost({ pageSize: 1000 }).then(response => {
        this.postOptions = response.data.list
      })
      listRole({ pageSize: 1000 }).then(response => {
        this.roleOptions = response.data.list
      })
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.username + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        resetUserPwd(row.userId, value).then(response => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
          } else {
            this.msgError(response.msg)
          }
        })
      }).catch(() => {})
    },

    /** 提交按钮 */
    submitForm: function() {
      var fileList = this.form.digitalLifeFileList
      this.form.digital_life_file_list = []
      fileList.forEach(file => {
        if(file instanceof Object){
          this.form.digital_life_file_list.push(file.name)
        }else{
          this.form.digital_life_file_list.push(file)
        }
      })
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.userId !== undefined) {
            updateUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addUser(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const Ids = (row.userId && [row.userId]) || this.ids
      this.$confirm('是否确认删除用户编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delUser({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {})
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams
      this.$confirm('是否确认导出所有用户数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return exportUser(queryParams)
      }).then(response => {
        this.download(response.msg)
      }).catch(function() {})
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = '用户导入'
      this.upload.open = true
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg)
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, digitalLifeFileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, digitalLifeFileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true })
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit()
    }
  }
}
</script>
<style>
.el-upload__tip {
  line-height: 1.2;
}
.el-form-item.el-col-4.el-form-item--medium>.el-form-item__content{
    margin-left: 8px!important;
}
</style>
