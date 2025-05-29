


          
# 客服系统 - Customer Service System

一个基于 Socket.io 的实时客服系统，支持客服与客户之间的实时通信，以及客服之间的内部沟通。

## 产品设计

### 功能概述

本系统提供完整的在线客服解决方案，包含以下核心功能：

#### 客户端功能
- **单一对话窗口**：客户只能与客服进行一对一对话
- **实时消息**：基于 WebSocket 的实时消息传输
- **简洁界面**：专注于对话体验的简洁用户界面
- **消息状态**：显示消息发送、接收状态

#### 客服端功能
- **多客户管理**：客服可以同时处理多个客户对话
- **客服间通信**：客服之间可以进行内部沟通和协作
- **对话分配**：智能分配新客户到可用客服
- **客户信息**：查看客户基本信息和对话历史
- **状态管理**：在线/离线/忙碌状态切换

### 用户角色

1. **客户（Customer）**
   - 只能与客服进行一对一对话
   - 无法直接联系其他客户
   - 被动等待客服分配

2. **客服（Agent）**
   - 可以同时处理多个客户
   - 可以与其他客服进行内部沟通
   - 主动管理对话分配

## 架构设计

### 技术栈

#### 后端
- **Node.js**：服务器运行环境
- **Express.js**：Web 框架
- **Socket.io**：实时通信
- **MongoDB**：数据存储（可选）
- **Redis**：会话管理和消息缓存（可选）

#### 前端
- **Vue.js 3**：前端框架（不使用 TypeScript）
- **Vue Router**：路由管理
- **Vuex/Pinia**：状态管理
- **Socket.io-client**：客户端 WebSocket
- **Element Plus**：UI 组件库

### 系统架构

```
┌─────────────────┐    ┌─────────────────┐
│   客户端应用     │    │   客服端应用     │
│  (Customer)     │    │   (Agent)       │
└─────────────────┘    └─────────────────┘
         │                       │
         │    WebSocket 连接      │
         └───────────┬───────────┘
                     │
            ┌─────────────────┐
            │   Node.js 服务器 │
            │   + Socket.io   │
            └─────────────────┘
                     │
            ┌─────────────────┐
            │   数据存储层     │
            │ (MongoDB/Redis) │
            └─────────────────┘
```

### 核心模块设计

#### 1. 连接管理模块
- 客户端连接识别和分类
- 连接状态监控
- 断线重连处理

#### 2. 消息路由模块
- 客户-客服消息路由
- 客服间消息路由
- 消息持久化

#### 3. 会话管理模块
- 对话会话创建和维护
- 客服分配算法
- 会话状态跟踪

#### 4. 用户管理模块
- 客服在线状态管理
- 客户排队机制
- 权限控制

### 数据流设计

#### 客户发起对话流程
1. 客户连接到系统
2. 系统分配可用客服
3. 建立客户-客服会话
4. 开始实时通信

#### 消息传递流程
1. 发送方发送消息
2. 服务器验证和路由
3. 推送到接收方
4. 确认消息送达

### Socket 事件设计

#### 客户端事件
```javascript
// 客户端发送
'customer:join'        // 客户加入
'customer:message'     // 发送消息
'customer:typing'      // 正在输入
'customer:disconnect'  // 断开连接

// 客户端接收
'agent:assigned'       // 分配客服
'agent:message'        // 接收消息
'agent:typing'         // 客服正在输入
'session:end'          // 会话结束
```

#### 客服端事件
```javascript
// 客服端发送
'agent:login'          // 客服登录
'agent:status'         // 状态更新
'agent:message'        // 发送消息
'agent:internal'       // 内部消息
'agent:typing'         // 正在输入

// 客服端接收
'customer:new'         // 新客户
'customer:message'     // 客户消息
'customer:typing'      // 客户正在输入
'agent:internal'       // 内部消息
'system:notification'  // 系统通知
```

### 项目结构

```
customer-service/
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── services/        # 业务逻辑
│   │   ├── socket/          # Socket 处理
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── server.js
├── customer-frontend/       # 客户端前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── views/           # 页面
│   │   ├── store/           # 状态管理
│   │   └── socket/          # Socket 客户端
│   ├── package.json
│   └── vite.config.js
├── agent-frontend/          # 客服端前端
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── views/           # 页面
│   │   ├── store/           # 状态管理
│   │   └── socket/          # Socket 客户端
│   ├── package.json
│   └── vite.config.js
└── README.md
```

### 部署方案

#### 开发环境
- 后端：`npm run dev`（端口 3000）
- 客户端：`npm run serve`（端口 8080）
- 客服端：`npm run serve`（端口 8081）

#### 生产环境
- 使用 PM2 管理 Node.js 进程
- Nginx 反向代理和负载均衡
- 支持 HTTPS 和 WSS

### 扩展性考虑

1. **水平扩展**：支持多服务器实例
2. **消息持久化**：重要消息存储到数据库
3. **文件传输**：支持图片、文件发送
4. **智能分配**：基于客服技能的智能分配
5. **数据分析**：对话质量和效率分析

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装和运行

1. 克隆项目
```bash
git clone <repository-url>
cd customer-service
```

2. 安装依赖
```bash
# 后端
cd backend && npm install

# 客户端
cd ../customer-frontend && npm install

# 客服端
cd ../agent-frontend && npm install
```

3. 启动服务
```bash
# 启动后端（端口 3000）
cd backend && npm run dev

# 启动客户端（端口 8080）
cd customer-frontend && npm run serve

# 启动客服端（端口 8081）
cd agent-frontend && npm run serve
```

4. 访问应用
- 客户端：http://localhost:8080
- 客服端：http://localhost:8081

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
        