**注：在请求字段中，带 \* 的为必须携带字段**

CoreWaGuanliDesuNe~1

```
nohup java -jar ... --spring.profiles.active=prod > logs/app.log 2>&1 &
```

# 统一响应格式

- sucess
  - 类型：bool
- message
  - 类型：String
- code
  - 类型：String
- data
  - 类型：JSON

**示例：**

```JSON
{
    "success": true,
    "message": "",
    "code": "SUCCESS",
    "data": null
}
```

# 可选字段

在所有 API 中，并非所有字段都是必须项。

对于可选字段 API，需要通过设置特殊的 Content-Type 实现字段可选功能。

此处约定，该 Content-Type 为 `application/nullable+json`。

# 实体列表

## 视图对象

### 用户视图对象 UserVo

- id
  - int64
  - 用户 ID
- username
  - str
  - 用户名
- nickname
  - str
  - 昵称
- account
  - str
  - 账号，自动生成，可用于登陆
- avatar
  - str
  - 头像 URL
- personalStatus
  - str
  - 个性签名
- phone
  - str
  - 手机号
- email
  - str
  - 邮箱
- birth
  - date yyyy-MM-dd
  - 生日
- registerDate
  - date yyyy-MM-dd
  - 注册日期

### 用户缩略视图对象 UserBriefVo

- id
  - int64
  - 用户 ID
- account
  - str
  - 账号，自动生成，可用于登陆
- nickname
  - str
  - 昵称
- avatar
  - str
  - 头像 URL
- personalStatus
  - str
  - 个性签名

### 用户注册视图对象 UserRegisterVo

- id
  - int64
  - 用户 ID
- token
  - str
  - 用户登陆 token
- account
  - str
  - 账号，自动生成，可用于登陆
- username
  - str
  - 用户名
- email
  - str
  - 邮箱

### 用户登陆视图对象 UserLoginVo

- token
  - str
  - 用户登录凭证

### 管理员视图对象 AdminVo

- id
  - int64
  - 管理员 ID
- name
  - str
  - 管理员名称
- authorities
  - array<AuthoryVo>
  - 权限列表
    - id int64 权限 ID
    - permissionName str 权限名称

### 分区视图对象 PartitionVo

- id
  - int64
  - 分区 ID
- name
  - str
  - 分区名
- visiblity
  - int
  - 可见性
  - 0 - 公开， 1 - 私人
- order
  - int64
  - 排序，数值越大越靠后
- children
  - array<PartitionVo>
  - 子分区

### 文章视图对象 ArticleVo

- id
  - int64
  - 文章 ID
- title
  - str
  - 标题
- visibility
  - int
  - 可见性 0 - 公开， 1 - 私人
- views
  - int64
  - 浏览量
- primary
  - str
  - 摘要
- authorId
  - int64
  - 作者 ID（即用户 ID）
- content
  - str
  - 内容
- postTime
  - datetime yyyy-MM-dd HH:mm:SS
  - 发布时间
- partitionId
  - int64
  - 分区 ID
- tags
  - array<str>
  - 标签列表
- comUseTags
  - array<int>
  - 常用标签列表
    - 常用标签 ID

### 文章缩略视图对象 ArticleBriefVo

- id
  - int64
  - 文章 ID
- title
  - str
  - 标题
- visibility
  - int
  - 可见性 0 - 公开， 1 - 私人
- views
  - int64
  - 浏览量
- primary
  - str
  - 摘要
- authorId
  - int64
  - 作者 ID（即用户 ID）
- postTime
  - datetime yyyy-MM-dd HH:mm:SS
  - 发布时间

### 文章评论视图对象 ArticleCommentVo

- id
  - int64
  - 评论 ID
- userId
  - int64
  - 用户 ID
- replyId
  - int64
  - 父评论 ID
- content
  - str
  - 评论内容
- commentTime
  - datetim
  - 评论时间

### 文章收藏视图对象 ArticleFavoriteVo

- articleId
  - int64
  - 文章 ID
- favoriteId
  - int64
  - 收藏 ID
- favoriteDate
  - 收藏时间
  - yyyy-MM-dd

### 收藏夹视图对象 FavoritesVo

- id
  - int64
  - 收藏夹 ID
- title
  - string
  - 收藏夹标题
- visiblity
  - int 0 - 公开 1 - 私密
  - 可见性
- isDefault
  - int 0 - 是 1 - 否
  - 是否为默认收藏夹

### 权限视图对象 AuthorityVo

- id
  - int64
  - 权限 ID
- permissionName
  - str
  - 权限名称

### 标签视图对象 TagVo

- id
  - int64
  - 标签 ID
- name
  - str
  - 标签名

## 数据传输对象

### 排序字段 OrderField

- field\*
  - str
  - 字段名称
- isAsc
  - bool
  - 是否升序，默认 true
- missing
  - str
  - 若该字段不存在，如何排序
  - 默认 \_last，不存在则放置在最后

### 用户更新 UserUpdateDto

- avatar
  - str
  - 头像地址
- personalStatus
  - str 长度[0, 50]
  - 个性签名
- nickname
  - str 长度[0, 20]
  - 昵称
- phone
  - str 长度[11, 20]
  - 电话号
- email
  - str 格式[邮箱]
  - 邮箱
- birth
  - date yyyy-MM-dd
  - 生日
  - 不得超过当前日期

### 用户订阅 UserSubDto

- 支持分页
- fromUser
  - int64
  - 来自用户
  - 在用户订阅操作时传递无效，会自动设置为登陆用户
  - 在获取用户订阅列表时传递有效，若设为空则获取登录用户
- toUser\*
  - int64
  - 订阅用户

### 用户注册 UserRegisterDto

- userId
  - int64
  - 用户 ID
  - 注册时内部传输使用，请求时设置无效
- password\*
  - str 长度[6-20]
  - 密码
- username\*
  - str 长度[2-20] 只能是数字与字母的组合
  - 暂不支持更新，提醒设置时需谨慎
  - 用户名
- email\*
  - str 格式[邮箱]
  - 邮箱

### 用户登陆 UserLoginDto

- account
  - str
  - 账号（或邮箱）
- password
  - str
  - 密码

### 分区 PartitionDto

- name\*
  - str 长度[1, 10]
  - 分区名
- parentId
  - int64
  - 父分区 ID
- visiblity
  - int
  - 可见性 0 - 公开，1 - 私人
- order
  - int64
  - 排序，越大越靠后

### 更新分区 PartitionUpdateDto

- id\*
  - int64
  - 分区 ID
- name
  - str
  - 分区名
  - 不得与已有分区重复
- parentId
  - int64
  - 父分区 ID
- visiblity
  - int
  - 可见性 0 - 公开，1 - 私人
- order
  - int64
  - 排序，越大越靠后

### 文章 ArticleDto

- title\*
  - str 长度[1, 20]
  - 标题
- primary
  - str 长度[0, 200]
  - 摘要
- content\*
  - str 长度[1, 2000]
  - 内容
- partitionId
  - int64
  - 分区 ID
- visibility
  - int
  - 可见性 0 - 公开， 1 - 私人
- tags
  - array<str>
  - 标签列表
- comUseTags
  - array<int>
  - 常用标签列表
    - 常用标签 ID

### 文章查询 ArticleQueryPageDto

- 支持分页
- id
  - int64
  - 文章 ID
- title
  - str
  - 文章标题（分词查询）
  - 支持高亮
- content
  - str
  - 文章内容（分词查询）
  - 支持高亮
- authorId
  - int64
  - 作者 ID（即用户 ID）
- partitionId
  - int64
  - 分区 ID
  - 仅当当前登录用户可访问该分区时才有效
- postStart
  - datetime yyyy-MM-dd HH:mm:SS
  - 指定发布日期 起始于
- postEnd
  - datetime yyyy-MM-dd HH:mm:SS
  - 指定发布日期 终止于
- highlight
  - bool
  - 是否开启高亮查询
  - <em class='highlight'> </em>
- sort
  - list<[OrderField](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Ff0md8iKxomncxxi5DAcrIRYn5f)>

### 更新文章 ArticleUpdateDto

- id\*
  - int64
  - 文章 ID
- title
  - str 长度[1, 20]
  - 标题
- primary
  - str 长度[0, 200]
  - 摘要
- content
  - str 长度[1, 2000]
  - 内容
- partitionId
  - int64
  - 分区 ID
- visibility
  - int
  - 可见性 0 - 公开， 1 - 私人
- tags
  - array<str>
  - 标签列表
- comUseTags
  - array<int>
  - 常用标签列表
    - 常用标签 ID

### 文章评论 ArticleCommentDto

- articleId\*
  - int64
  - 文章 ID
- userId\*
  - int64
  - 用户 ID
- replyId
  - int64
  - 父评论 ID
- content\*
  - str
  - 评论内容

### 文章评论查询 ArticleCommentQueryDto

- 支持分页
- articleId\*
  - int64
  - 文章 ID
- userId
  - int64
  - 用户 ID
- replyId
  - int64
  - 父评论 ID

### 文章评论删除 ArticleCommentDeleteDto

- articleId\*
  - int64
  - 目标文章 ID
- commentId\*
  - int64
  - 目标评论 ID

### 文章暂存 ArticleDraftDto

- 对于所有可选字段，若不传递则默认将存储为 null
- id\*
  - int64
  - 文章 ID
- title\*
  - str 长度[1, 20]
  - 标题
- primary
  - str 长度[0, 200]
  - 摘要
- partitionId
  - int64
  - 分区 ID
- content\*
  - str 长度[1, 2000]
  - 内容
- visibility
  - int
  - 可见性 0 - 公开， 1 - 私人
- tags
  - array<str>
  - 标签列表
- comUseTags
  - array<int>
  - 常用标签列表
    - 常用标签 ID

### 文章收藏 ArticleFavoriteDto

- articleId\*
  - int64
  - 文章 ID
- favoritesId\*
  - int64
  - 收藏夹 ID

### 收藏夹文章查询 FavoritesArticlePageDto

- 支持分页
- favoritesId\*
  - int64
  - 收藏夹 ID

### 收藏夹 FavoritesDto

- title\*
  - str
  - 收藏夹名称
- visilibity
  - int 0 - 公开 1 - 私密
  - 可见性
- isDefault
  - int 0 - 非默认 1 - 默认
  - 默认收藏夹

### 修改收藏夹 FavoritesUpdateDto

- application/nullable+json
- id\*
  - int64
  - 收藏夹 ID
- title
  - str
  - 收藏夹名称
- visiblity
  - int 0 - 公开 1 - 私密
  - 可见性
- isDefault
  - int 0 - 非默认 1 - 默认
  - 默认收藏夹

### 管理员用户控制 AdminUserControlDto

- userId\*
  - int64
  - 用户 ID
- password\*
  - str
  - 管理员的登陆密码

### 添加管理员 AdminPostDto

- name\*
  - str
  - 管理员名
- userId\*
  - int64
  - 管理员所属用户 ID

### 更新管理员 AdminUpdateDto

- id\*
  - int64
  - 管理员 ID
- name
  - str
  - 管理员名称
- authorities
  - array<int>
  - 权限列表
    - 权限 ID

### 权限 AuthorityByIdDto

- adminId\*
  - int64
  - 管理员 ID
- ids
  - array<int64>
  - 权限 ID 列表

### 标签删除 TagDeleteDto

- ids\*
  - set<int>
  - 要删除的标签 ID

### 标签 TagDto

- name\*
  - str 长度[1, 10]
  - 标签名

### 标签更新 TagUpdateDto

- id\*
  - int64
  - 标签 ID
- name\*
  - str 长度[1, 20]
  - 标签名

# 分页查询

## 请求体

所有支持分页的接口，均可添加分页请求体。

**PageDto**

- pageNumber 页数
  - int
- pageSize：每页大小
  - int

## 响应体

**PageResult**

- records：分页结果
  - list
- currentPage：当前页
  - int
- totalPage：总页数
  - int
- totalRow: 总条数
  - int

## 支持分页的接口

- 文章查询接口 POST /article/query
- 获取关注列表接口 POST /user/subscribe
- 获取收藏夹下的文章接口 POST /article/favorites

# 用户接口 /user

## 登陆

- POST /login
- 请求：JSON [UserLoginDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-NfeDdfgcToIfvaxtS05cyf9Jndh)
- 响应：JSON [UserLoginVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Dr2fdAT4woUg1VxwT3dciNbXnmh)
  - 成功示例
    - `{    "success": true,    "message": "",    "code": "SUCCESS",    "data": {        "token": "xxx"    } }`
  - 失败示例
    - `{    "success": false,    "message": "验证失败",    "code": "AUTH_FAILED",    "data": null }`

## 注册

- POST /register
- 请求: JSON [UserRegsiterDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-AfvUdxpjKo7oBKxIMqjcUp2fnHe)
- 响应: JSON [UserRegisterVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-O9CkdWITfo5hE6xZLdScMe2Qnng)
  - 成功示例
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10005,        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDAwNSIsImV4cCI6MTc1NDcwMTYwOH0.F28LnxkEIupAmzpykbYm9v2TpH-XOApM208N7SVMb6E",        "account": "rylin#219772",        "username": "rylin",        "email": "linexwolf4@icloud.com"    } }`
  - 失败示例
    - `{    "success": false,    "message": "用户已存在！",    "code": "USER_ALREADY_EXIST",    "data": null }`

## 获取

- GET /{id}
- 请求参数 【可选】
  - id：用户 ID
  - 若不携带 ID，则默认获取当前登录用户信息
- 响应 JSON - [UserVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-FPPEdYkkPoyEgYxme6JcO9rWnug)
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10001,        "username": "rylin",        "nickname": "夜凌",        "account": "rylin#849391",        "avatar": "",        "personalStatus": "这是我的个性签名",        "phone": "12311412412412421",        "email": "linexwolf@icloud.com",        "birth": "2001-06-17",        "registerDate": "2025-08-06"    } }`
  - `{    "success": false,    "message": "用户不存在！",    "code": "USER_NOT_EXIST",    "data": null }`

## 修改

- PUT
- 请求 JSON [UserUpdateDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-YdRtd1QkMoWqZkx3uKBczVwRnUf)
- 响应 JSON - [UserVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-FPPEdYkkPoyEgYxme6JcO9rWnug)
- 请求示例
  - `{    "avatar": "",    "personalStatus": "这是我的个性签名",    "nickname": "夜凌",    "phone": "13111111111",    "email": "linexwolf@icloud.com",    "birth": "2000-01-01" }`
- 响应示例
  - 成功
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10001,        "username": "rylin",        "nickname": "夜凌",        "account": "rylin#5657621",        "avatar": "",        "personalStatus": "这是我的个性签名",        "phone": "13",        "email": "linexwolf@icloud.com",        "birth": "2001-06-17",        "registerDate": "2025-07-28"    } }`
  - 失败
  - `{    "success": false,    "message": "字段格式有误",    "code": "ARG_NOT_VALID",    "data": null }`

## 关注

- PUT /subscribe
- 请求 JSON [UserSubDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-HAgkdlQTPoq6iPxEuZicCnQynvQ)
- 响应 null
- 示例
  - 请求
    - `{    "toUser": 0 }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
    - `{    "success": false,    "message": "无法访问该用户",    "code": "USER_NOT_EXIST",    "data": null }`

## 取消关注

- DELETE /subscribe
- 请求 JSON [UserSubDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-HAgkdlQTPoq6iPxEuZicCnQynvQ)
- 响应 null
- 示例
  - 请求
    - `{    "toUser": 10002 }`
  - 响应
    - `{    "success": false,    "message": "未关注该用户！",    "code": "ACCESS_DENIED",    "data": null }`

## 获取关注列表

- POST /subscribe
- 支持分页
- 请求 JSON [UserSubDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-HAgkdlQTPoq6iPxEuZicCnQynvQ)
- 响应 JSON array<[UserBriefVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-XvCJdpTOZo7211x4995cMoPpne6)>
- 示例
  - 请求
    - `{    "fromUser": 0 }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "records": [            {                "id": 10002,                "account": "rylin#867964",                "nickname": null,                "avatar": null,                "personalStatus": null            }        ],        "currentPage": 1,        "totalPage": 3,        "totalRow": 3    } }`
    - `{    "success": false,    "message": "用户不存在！",    "code": "USER_NOT_EXIST",    "data": null }`

## 删除

- DELETE
- 无需请求体
- 响应 null
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
  - `{    "success": false,    "message": "身份未验证",    "code": "UN_LOGIN",    "data": null }`

## 按用户名查找

- GET /n/{name}
- 请求 路径参数
  - name
    - str
    - 用户名（模糊匹配）
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 10008,            "username": "ruixe",            "nickname": null,            "account": "ruixe#273493",            "avatar": null,            "personalStatus": null,            "phone": null,            "email": "ruixewolf@outlook.com",            "birth": null,            "registerDate": "2025-08-17"        }    ] }`
  - `{    "success": false,    "message": "字段验证未通过",    "code": "ARG_NOT_VALID",    "data": null }`

## 按 ID 批量获取简略信息

- GET /brief
- 请求参数
  - array<int>
  - 要获取的用户 ID
- 响应 JSON array<[UserBriefVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-XvCJdpTOZo7211x4995cMoPpne6)>
- 示例
  - 响应
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 10000,            "account": "admin",            "nickname": null,            "avatar": null,            "personalStatus": null        },        {            "id": 10006,            "account": "rylin#529907",            "nickname": null,            "avatar": null,            "personalStatus": null        }    ] }`

# 文章接口: /article

## 检索查询

- POST /query
- 支持分页
- application/nullable+json
- 请求 JSON [ArticleQueryPageDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-BrBudyuIYoiNrPxkxgNcrElXnLb)
- 响应 JSON
  - 默认 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-EoQIdmMLPoFqQxxz1qWcpxTdn0J)<[ArticleBriefVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-BT0Ldh9g3oVDCoxWSEtcfbxNnGb)>
  - 若开启高亮且查询 内容 content，则 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-EoQIdmMLPoFqQxxz1qWcpxTdn0J)<[ArticleVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-NUxxdgRH4o7MVbxYjClcRgFLnKc)>
- 支持高亮显示
  - 若传递 highlight 为 true，则开启高亮
  - 支持高亮显示的字段：标题 title 、内容 content
  - 开启高亮时，若传递了 内容 content，则会自动响应为 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-EoQIdmMLPoFqQxxz1qWcpxTdn0J)<[ArticleVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-NUxxdgRH4o7MVbxYjClcRgFLnKc)>
- 排序字段从前往后依次匹配
  - 可排序字段
    - postTime
    - views
- 示例
  - 请求 【不开启高亮】
  - `{    "id": null,    "title": null,    "authorId": null,    "partitionId": 100031,    "postStart": "2000-01-01 00:00:00",    "postEnd": null,    "pageNumber": "1",    "pageSize": 10 }`
  - 响应 【不开启高亮】
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "records": [            {                "id": 100000000,                "title": "修改后的标题",                "primary": null,                "authorId": 10001,                "postTime": "2025-08-07 17:41:38",                "views": 1            }        ],        "currentPage": 1,        "totalPage": 1,        "totalRow": 1    } }`
  - 请求【开启高亮】
    - `{    "id": null,    "title": "熬",    "content": "熬穿",    "authorId": null,    "partitionId": null,    "postStart":null,    "postEnd": null,    "pageNumber": "1",    "highlight": true,    "pageSize": 10 }`
  - 响应【开启高亮】
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "records": [            {                "id": 100822006,                "title": "又<em class='highlight'>熬</em><em class='highlight'>穿</em>了啊..",                "primary": "呃...",                "authorId": 10000,                "content": "# 9.23\n又不小心<em class='highlight'>熬</em><em class='highlight'>穿</em>                了啊...\n修复了一堆 bug\n整合了 ES",                "postTime": "2025-09-23 06:07:30",                "partitionId": null,                "tags": [],                "comUseTags": [],                "visibility": 0,                "views": 1            }        ],        "currentPage": 1,        "totalPage": 1,        "totalRow": 1    } }`
  - `{    "success": false,    "message": "请求体验证未通过",    "code": "BAD_REQUEST",    "data": null }`

## 查询

- GET /{id}
- 请求 PathVariable
  - id\*: 文章 ID
- 响应 JSON - [ArticleVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-F8ZUd2oOqoVuotxALGEc05zEnvh)
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 100000000,        "title": "测",        "primary": "这是测试摘要",        "authorId": 10000,        "content": "0",        "postTime": "2025-08-01 15:45:40",        "partitionId": null,        "tags": [            null        ],        "comUseTags": []    } }`
  - `{    "success": false,    "message": "无法获取文章信息",    "code": "ACCESS_DENIED",    "data": null }`

## 添加

- POST
- 请求 JSON [ArticleDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-JFCNdx1rjongy2xJr0TcJ160njd)
- 响应 JSON - [ArticleVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-BvXadTCN3oC9v1xWqyocgC2JnXg)
- 示例
  - 请求
    - `{    "title": "测试",    "primary": null,    "content": "1",    "visibility": 0,    "tags": [],    "comUseTags": [] }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 100000011,        "title": "测试",        "primary": null,        "authorId": 10000,        "content": "123",        "postTime": "2025-08-05 17:41:01",        "partitionId": null,        "tags": [],        "comUseTags": []    } }`
    - `{    "success": false,    "message": "字段验证未通过",    "code": "VERIFY_FAILED",    "data": null }`

## 修改

- PATCH
- application/nullable+json
- 请求 JSON [ArticleUpdateDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-O3rwdOwVIo1uP6xXguwcmKWjnPM)
- 响应 JSON - [ArticleVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-BvXadTCN3oC9v1xWqyocgC2JnXg)
- 示例
  - 请求
    - ` {    "id": 1,    "title": null,    "primary": "123",    "content": null,    "visiblity": 0,    "partitionId": null,    "tags": ["在"],    "comUseTags": null }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 100000012,        "title": "测试",        "primary": "123",        "authorId": 10000,        "content": "123123",        "postTime": "2025-08-05 17:44:01",        "partitionId": null,        "tags": [            "在"        ],        "comUseTags": []    } }`
    - `{    "success": false,    "message": "访问不被允许",    "code": "ACCESS_DENIED",    "data": null }`

## 删除

- DELETE /{id}
- 请求 PathVarable
  - id\*: 文章 ID
- 响应 null
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
  - `{    "success": false,    "message": "访问不被允许",    "code": "ACCESS_DENIED",    "data": null }`

## 获取评论

- POST /comment
- application/nullable+json
- 请求体 [ArticleCommentQueryDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#IInSd9HHIotbbcx6mCec7K5XnAb)
- 响应 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-XovldrUQTo45MHxJsulcK1pjnDb)<[ArticleCommentVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-KkBSdG5KeomuZPxgkUbc7mrgnrh)>
- 示例
  - 请求
    - `{    "articleId": 100000000,    "userId": null,    "replyId": null }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "records": [            {                "id": 10000000,                "userId": 10000,                "replyId": null,                "content": "11",                "commentTime": "2025-08-27 10:57:43"            }        ],        "currentPage": 1,        "totalPage": 1,        "totalRow": 1    } }`
    - `{    "success": false,    "message": "无法访问该文章！",    "code": "ACCESS_DENIED",    "data": null }`

## 发布评论

- POST /comment/post
- 请求体 [ArticleCommentDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-D9DudaFYooubEtxEaJDc89D4nqh)
- 响应 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-XovldrUQTo45MHxJsulcK1pjnDb)<[ArticleCommentVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-KkBSdG5KeomuZPxgkUbc7mrgnrh)>
- 示例

## 删除评论

- DELETE /comment
- 请求体 [ArticleCommentDeleteDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-R5qOd9xC0ogRbSx3QIYcy7kNnze)
- 响应 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-XovldrUQTo45MHxJsulcK1pjnDb)<[ArticleCommentVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-KkBSdG5KeomuZPxgkUbc7mrgnrh)>
- 示例

## 查询点赞

- GET /like/{id}
- 请求参数
  - id 文章 ID
- 响应 Boolean
- 示例

## 点赞

- POST /like/{id}
- 请求参数
  - id 文章 ID
- 响应 Boolean
- 示例

## 取消点赞

- DELETE /like/{id}
- 请求参数
  - id 文章 ID
- 响应 Boolean
- 示例

## 收藏文章

- POST /favorite
- 请求体 [ArticleFavoriteDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-CW6rdIs9io8vkix9HeXcbqjUnNg)
- 响应 Boolean
- 示例

## 取消收藏

- DELETE /favorite
- 请求体 [ArticleFavoriteDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-CW6rdIs9io8vkix9HeXcbqjUnNg)
- 响应 Boolean
- 示例

## 获取文章所属收藏夹列表

- GET /favorite/{articleId}
- 请求参数
  - articleId 文章 ID
- 响应 Array<[ArticleFavoriteVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-V4GpdhEe7oJM3MxuX25cg9l2nph)>
- 示例

## 获取收藏夹的文章列表

- POST /favorites
- 请求体 [FavoritesArticlePageDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-H3mXd6tTpoNUGfxieZQcCqZTnph)
- 响应 [PageResult](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-EoQIdmMLPoFqQxxz1qWcpxTdn0J)<[ArticleBriefVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-BT0Ldh9g3oVDCoxWSEtcfbxNnGb)>
- 示例

# 收藏夹接口 /favorites

## 获取用户收藏夹

- GET /{userId}
- 请求参数
  - userId 用户 ID
- 响应 Array<[FavoritesVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-ZbY1dc1wKoK7jBxzaHbcwMzVnhf)>
- 示例

## 获取默认用户收藏夹

- GET
- 无需请求参数
- 响应 [FavoritesVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-ZbY1dc1wKoK7jBxzaHbcwMzVnhf)
- 示例

## 删除

- DELETE /{favoritesId}
- 请求参数
  - favoritesId 收藏夹 ID
- 响应 Array<[FavoritesVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-ZbY1dc1wKoK7jBxzaHbcwMzVnhf)>
- 示例

## 新建

- POST
- 请求体 [FavoritesDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Z5t5dmrg4om6aUxONUrctcE8nNf)
- 响应 Array<[FavoritesVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-ZbY1dc1wKoK7jBxzaHbcwMzVnhf)>
- 示例

## 修改

- PATCH
- 请求体 [FavoritesUpdateDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Ay2HdKs2QoAMzzxzTOucF3GKnJe)
- 响应 [FavoritesVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-ZbY1dc1wKoK7jBxzaHbcwMzVnhf)
- 示例

# 管理员接口 /api/a

## 添加

- POST
- 请求体 JSON [AdminPostDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-QOLPdpPCJoyfLVxJfHMcT5XYnie)
- 响应 JSON [AdminVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-W3yMdhr0fopYqJxf4LXcnLBfn1f)
- 示例
  - 请求
    - `{  "name": "Rylin",  "userId": 10001 }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10013,        "name": "Rylin",        "authorities": []    } }`
    - `{    "success": false,    "message": "管理员已存在！",    "code": "ACCESS_DENIED",    "data": null }`

## 更新

- PATCH
- application/nullable+json
- 请求体 JSON [AdminUpdateDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-LhEyd8bvGoWAYMx2xOdcn8hPnrg)
- 响应 JSON [AdminVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-YNn3ddlcbo7vWyxrC7Bc5hbVnXf)
- 示例
  - 请求
    - `{    "id": 10000,    "name": "Rylin",    "authorities": [1,2] }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10000,        "name": "Rylin",        "authorities": [            {                "id": 1,                "permissionName": "创建管理员"            },            {                "id": 2,                "permissionName": "修改管理员"            }        ]    } }`
    - `{    "success": false,    "message": "字段不得全为空",    "code": "ACCESS_DENIED",    "data": null }`

## 获取权限列表

- GET /au
- 响应 JSON list<[AuthorityVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-TOlNdekMQot68UxmwQPciRhmnrT)>
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 1,            "permissionName": "创建管理员"        },        {            "id": 2,            "permissionName": "修改管理员"        }    ] }`

## 删除管理员

- DELETE /{adminId}
- 请求体 路径参数
  - adminId\* 管理员 ID
- 响应 null
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
  - `{    "success": false,    "message": "管理员不存在！",    "code": "ACCESS_DENIED",    "data": null }`

## 删除用户

- DELETE /user
- 请求体 JSON [AdminUserControlDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-CoXtdvARFo2PMvxrfX1cCjTrnMd)
- 响应 null
- 示例
  - 请求
    - `{    "userId": 10006,    "password": "123123" }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
    - `{    "success": false,    "message": "验证失败",    "code": "ACCESS_DENIED",    "data": null }`

## 禁用用户

- DELETE /user/disable
- 请求体 JSON [AdminUserControlDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-CoXtdvARFo2PMvxrfX1cCjTrnMd)
- 响应 null
- 示例
  - 请求
    - `{    "userId": 10005,    "password": "123123" }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
    - `{    "success": false,    "message": "账号被停用",    "code": "BANNED",    "data": null }`

## 启用用户

- PUT /user/enable
- 请求体 JSON [AdminUserControlDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-CoXtdvARFo2PMvxrfX1cCjTrnMd)
- 响应 null
- 示例
  - 请求
    - `{    "userId": 10006,    "password": "123123" }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
    - `{    "success": false,    "message": "业务异常: 账户已启用！",    "code": "SERVICE_ERROR",    "data": null }`

# 分区接口 /part

## 获取分区结构

- GET
- 无请求体
- 响应 JSON list<[PartitionVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-KfwBdMoJXotszIxRWS2cZ09Dnjh)>
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 100000,            "name": "测试0",            "visibility": 0,            "order": 0,            "children": [                {                    "id": 100004,                    "name": "测试 11",                    "visibility": 0,                    "order": 5,                    "children": [                        {                            "id": 100012,                            "name": "测试 112",                            "visibility": 0,                            "order": 5,                            "children": null                        }]}]}]}`

## 添加

- POST
- 请求体 JSON [PartitionDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-XQPYdbLWSo9OgWxH2nzcJVsenVI)
- 响应 JSON [PartitionVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-SxTEdOKoyo8wpmxdOBycMa15nNg)
- 示例
  - 请求
    - `{    "name": "测试43",    "parentId": 100025,    "visiblity": 0 }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 100003,            "name": "测试4",            "visibility": 0,            "order": 4,            "children": [                {                    "id": 100025,                    "name": "测试42",                    "visibility": 0,                    "order": 5,                    "children": [                        {                            "id": 100031,                            "name": "测试43",                            "visibility": 0,                            "order": 0,                            "children": null                        }                    ]                }            ]        }    ] }`
    - `{    "success": false,    "message": "分区已存在！",    "code": "ACCESS_DENIED",    "data": null }`

## 更新

- PATCH
- application/nullable+json
- 请求体 JSON [PartitionUpdateDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-YT7Vdo88ro5gfAx9l98cabtIn4e)
- 响应体 JSON [PartitionVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-SxTEdOKoyo8wpmxdOBycMa15nNg)
- 示例
  - 请求
    - `{    "id": 100000,    "name": "测试01" }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 100000,            "name": "测试02",            "visibility": 0,            "order": 0,            "children": []        }    ] }`
    - `{    "success": false,    "message": "字段不得全为空",    "code": "ACCESS_DENIED",    "data": null }`

## 删除

- DELETE /{id}
- 请求体 路径参数 id - 要删除的分区 ID
- 响应 JSON 删除指定 ID 后的分区结构 [PartitionVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-SxTEdOKoyo8wpmxdOBycMa15nNg)

## 级联删除

- 会删除指定分区 ID 下的所有分区
- DELETE /batch/{id}
- 请求体 路径参数 id - 要删除的分区 ID
- 响应 JSON 删除指定 ID 后的分区结构 [PartitionVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-SxTEdOKoyo8wpmxdOBycMa15nNg)

# 标签接口 /tag

## 添加

- POST
- 请求 JSON [TagDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-TarpdGkquofqEkxIrHvcQsf0nnh)
- 响应 JSON [TagVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-WF9jdyrAPogNRqxiHfrcsWfDnKg)
- 示例
  - 请求
    - `{    "name": "标签4" }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 10000002,            "name": "标签2"        },        {            "id": 10000004,            "name": "标签4"        }    ] }`
    - `{    "success": false,    "message": "标签已存在！",    "code": "ACCESS_DENIED",    "data": null }`

## 修改

- PUT
- 请求 JSON [TagUpdateDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-TzSPdKYbAoQyBBxjs4bcdBbSnbc)
- 响应 JSON [TagVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-WF9jdyrAPogNRqxiHfrcsWfDnKg)
- 示例
  - 请求
    - `{    "id": 10000002,    "name" : "标签222" }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10000002,        "name": "标签222"    } }`
    - `{    "success": false,    "message": "访问不被允许",    "code": "ACCESS_DENIED",    "data": null }`

## 删除

- DELETE
- 请求 JSON [TagDeleteDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Mtx4dG8MYoT1WfxzvUGce0vEnAf)
- 响应 null
- 示例
  - 请求
    - `{    "ids": [10000001, 10000003] }`
  - 响应
    - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": null }`
    - `{    "success": false,    "message": "标签不存在！",    "code": "ACCESS_DENIED",    "data": null }`

## 获取列表

- GET
- 无需请求体
- 响应 JSON array<[TagVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-LgiKd0qcIo6qvqx5xBacKHHEn56)>
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": [        {            "id": 10000002,            "name": "标签2"        },        {            "id": 10000004,            "name": "标签4"        }    ] }`

## 根据 ID 获取

- GET /{id}
- 请求参数
  - id 标签 ID
- 响应 JSON [TagVo](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-LgiKd0qcIo6qvqx5xBacKHHEn56)
- 响应示例
  - `{    "success": true,    "message": null,    "code": "SUCCESS",    "data": {        "id": 10000003,        "name": "标签3"    } }`

# 权限接口 /api/a/auth

## 添加

- POST
- 需要权限
  - admin:authority:create
  - admin:authority:update
- 请求体 [AuthorityByIdDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Bkmid3gD9oW6Ldx5f9IcpmB7n1b)
- 响应 Boolean
- 示例

## 删除

- DELETE
- 需要权限
  - admin:authority:delete
  - admin:authority:update
- 请求体 [AuthorityByIdDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Bkmid3gD9oW6Ldx5f9IcpmB7n1b)
- 响应 Boolean
- 示例

## 分配

- PUT
- 需要权限
  - admin:authority:update
- 请求体 [AuthorityByIdDto](https://wimdtwicc30.feishu.cn/docx/VFqXdLvcbo7tGqxoFYDcSfl5nvd#share-Bkmid3gD9oW6Ldx5f9IcpmB7n1b)
- 响应 Boolean
- 示例

# 常见问题

## 字段验证失败

- 一般为请求字段格式有误

## 服务器错误 500

- 检查请求的 URL 是否为可选字段接口，若是，则检查 `Content-Type` 是否为 `application/nullable+json`。
- 若 `code` 为 `SERVICE_ERROR`，则代表请求处理失败，抛出了业务异常，但该业务异常未自定义捕捉
- 以上无误，则为后端 Bug

# docker

```Dockerfile
docker run -d \
        --name mysql \
        --memory=600m \
        -p 3306:3306 \
        -e TZ=Asia/Shanghai \
        -e MYSQL_ROOT_PASSWORD=MySQL191001 \
        -v /root/container/mysql/data:/var/lib/mysql \
        -v /root/container/mysql/conf:/etc/mysql/conf.d \
        --restart always \
        mysql


docker run -d \
        --name mq \
        -p 5672:5672 \
        -p 15672:15672 \
        --restart always \
        rabbitmq:3.8

rylin
LgELb.191001#mq


docker run -d \
        --name redis \
        --memory=200m \
        -p 6379:6379 \
        --restart always \
        redis \
        --requirepass 'Redis191001'


# es
docker run -d \
        --name es \
        --memory=1200m \
        --memory-swap=1500m \
        -p 9200:9200 \
        -p 9300:9300 \
        -e "discovery.type=single-node" \
        -e ELASTIC_PASSWORD=ElasticSearch123456 \
        -e ES_JAVA_OPTS="-Xms512m -Xmx512m" \
        elasticsearch:8.18.7


curl --cacert elasticsearch-8.18.7/config/certs/http_ca.crt -u elastic:ElasticSearch123456 -k -X POST "https://localhost:9200/_security/api_key" -H 'Content-Type: application/json' -d '{ "name": "wolfblog" }'


{
  "id": "C7qQa5kBrn8LPt_6v1jb",
  "name": "wolfBlog",
  "api_key": "xMLsCfJSfpkc-awcbRHx2A",
  "encoded": "QzdxUWE1a0JybjhMUHRfNnYxamI6eE1Mc0NmSlNmcGtjLWF3Y2JSSHgyQQ==",
  "beats_logstash_format": "C7qQa5kBrn8LPt_6v1jb:xMLsCfJSfpkc-awcbRHx2A"
}
```
