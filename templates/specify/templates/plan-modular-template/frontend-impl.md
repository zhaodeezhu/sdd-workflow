# 前端实现细节

> 本文档描述前端组件、Store 和路由实现

## 1. Store 设计

### 1.1 Store 文件

**文件路径**: `cap-front/frontend/src/pages/{module}/{feature}/stores/{Name}Store.js`

```javascript
import { observable, action, runInAction } from 'mobx';
import * as api from '~/_utils/api/{module}';

class {Name}Store {
  @observable list = [];
  @observable loading = false;
  @observable total = 0;
  @observable currentPage = 1;
  @observable pageSize = 20;

  /**
   * 查询列表
   */
  @action
  async fetchList(params = {}) {
    this.loading = true;
    try {
      const response = await api.list({
        ...params,
        pageNum: this.currentPage,
        pageSize: this.pageSize
      });

      runInAction(() => {
        if (response.status === '0') {
          this.list = response.data.list || [];
          this.total = response.data.total || 0;
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loading = false;
      });
      console.error('查询失败:', error);
    }
  }

  /**
   * 创建
   */
  @action
  async create(data) {
    const response = await api.create(data);
    if (response.status === '0') {
      // 刷新列表
      await this.fetchList();
      return true;
    }
    return false;
  }

  /**
   * 更新分页
   */
  @action
  setPage(page, pageSize) {
    this.currentPage = page;
    this.pageSize = pageSize;
  }
}

export default new {Name}Store();
```

## 2. 页面组件

### 2.1 列表页面

**文件路径**: `cap-front/frontend/src/pages/{module}/{feature}/List.jsx`

```jsx
import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Input, Space } from 'antd';
import {Name}Store from './stores/{Name}Store';

const {Name}List = observer(() => {
  const [keyword, setKeyword] = React.useState('');

  useEffect(() => {
    {Name}Store.fetchList();
  }, []);

  const handleSearch = () => {
    {Name}Store.fetchList({ keyword });
  };

  const handlePageChange = (page, pageSize) => {
    {Name}Store.setPage(page, pageSize);
    {Name}Store.fetchList({ keyword });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      )
    }
  ];

  return (
    <div className="{module}-{feature}-list">
      <div className="toolbar">
        <Space>
          <Input
            placeholder="搜索关键字"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button>新建</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={toJS({Name}Store.list)}
        loading={{Name}Store.loading}
        rowKey="id"
        pagination={{
          current: {Name}Store.currentPage,
          pageSize: {Name}Store.pageSize,
          total: {Name}Store.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handlePageChange
        }}
      />
    </div>
  );
});

export default {Name}List;
```

### 2.2 详情页面

**文件路径**: `cap-front/frontend/src/pages/{module}/{feature}/Detail.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { Descriptions, Spin } from 'antd';
import * as api from '~/_utils/api/{module}';

const {Name}Detail = ({ id }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await api.getById(id);
      if (response.status === '0') {
        setData(response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (!data) {
    return <div>暂无数据</div>;
  }

  return (
    <Descriptions title="详情信息" bordered column={2}>
      <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
      <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
      <Descriptions.Item label="描述" span={2}>
        {data.description}
      </Descriptions.Item>
      <Descriptions.Item label="状态">{data.status}</Descriptions.Item>
      <Descriptions.Item label="创建时间">{data.createdTime}</Descriptions.Item>
    </Descriptions>
  );
};

export default {Name}Detail;
```

## 3. 路由配置

### 3.1 路由定义

**文件路径**: `cap-front/frontend/src/routers/config/{module}/index.js`

```javascript
import LoadableComponent from '~/_utils/LoadableComponent';

export default [
  {
    name: '{功能名称}',
    path: '{feature}',
    routes: [
      {
        name: '列表',
        path: 'list',
        component: LoadableComponent(() => import('~/pages/{module}/{feature}/List'))
      },
      {
        name: '详情',
        path: 'detail/:id',
        component: LoadableComponent(() => import('~/pages/{module}/{feature}/Detail'))
      }
    ]
  }
];
```

## 4. 样式文件

### 4.1 Less 样式

**文件路径**: `cap-front/frontend/src/pages/{module}/{feature}/List.less`

```less
.{module}-{feature}-list {
  padding: 16px;

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ant-table {
    background: #fff;
  }
}
```

## 5. 组件通信

### 5.1 父子组件通信

```jsx
// 父组件
<ChildComponent
  data={data}
  onChange={handleChange}
/>

// 子组件
const ChildComponent = ({ data, onChange }) => {
  return <div onClick={() => onChange(newData)}>...</div>;
};
```

### 5.2 Store 共享

```jsx
// 组件A
import {Name}Store from './stores/{Name}Store';

// 组件B
import {Name}Store from './stores/{Name}Store';
// 共享同一个 Store 实例
```

---

返回 [计划索引](./README.md)
