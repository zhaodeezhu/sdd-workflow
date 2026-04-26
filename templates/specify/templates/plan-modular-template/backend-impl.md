# 后端实现细节

> 本文档描述后端 Service 和 Repository 实现

## 1. Service 层实现

### 1.1 Service 接口

**文件路径**: `cplm-pdm/.../service/{Name}Service.java`

```java
public interface {Name}Service {

    /**
     * 查询列表
     */
    PageInfo<{Name}DTO> list(String keyword, String status, Integer pageNum, Integer pageSize);

    /**
     * 查询详情
     */
    {Name}DTO getById(Long id);

    /**
     * 创建
     */
    Long create({Name}RequestDTO request);

    /**
     * 更新
     */
    void update(Long id, {Name}RequestDTO request);

    /**
     * 删除
     */
    void delete(Long id);
}
```

### 1.2 Service 实现

**文件路径**: `cplm-pdm/.../service/impl/{Name}ServiceImpl.java`

```java
@Service
public class {Name}ServiceImpl implements {Name}Service {

    @Autowired
    private {Name}Repository repository;

    @Override
    public PageInfo<{Name}DTO> list(String keyword, String status, Integer pageNum, Integer pageSize) {
        // 1. 构建查询条件
        {Name}Query query = new {Name}Query();
        query.setKeyword(keyword);
        query.setStatus(status);

        // 2. 分页查询
        PageHelper.startPage(pageNum, pageSize);
        List<{Name}Entity> entities = repository.selectByQuery(query);

        // 3. 转换为DTO
        List<{Name}DTO> dtos = entities.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());

        return new PageInfo<>(dtos);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create({Name}RequestDTO request) {
        // 1. 参数校验
        validateRequest(request);

        // 2. 转换为实体
        {Name}Entity entity = toEntity(request);

        // 3. 保存到数据库
        repository.insert(entity);

        return entity.getId();
    }

    private void validateRequest({Name}RequestDTO request) {
        // 业务校验逻辑
        if (StringUtils.isBlank(request.getName())) {
            throw new BusinessException("名称不能为空");
        }
    }

    private {Name}DTO toDTO({Name}Entity entity) {
        // Entity -> DTO 转换
        {Name}DTO dto = new {Name}DTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private {Name}Entity toEntity({Name}RequestDTO request) {
        // DTO -> Entity 转换
        {Name}Entity entity = new {Name}Entity();
        BeanUtils.copyProperties(request, entity);
        return entity;
    }
}
```

## 2. Repository 层实现

### 2.1 Repository 接口

**文件路径**: `cplm-pdm/.../repository/{Name}Repository.java`

```java
@Repository
public interface {Name}Repository {

    /**
     * 根据查询条件查询列表
     */
    List<{Name}Entity> selectByQuery({Name}Query query);

    /**
     * 根据ID查询
     */
    {Name}Entity selectById(Long id);

    /**
     * 插入
     */
    int insert({Name}Entity entity);

    /**
     * 更新
     */
    int updateById({Name}Entity entity);

    /**
     * 删除
     */
    int deleteById(Long id);
}
```

### 2.2 MyBatis Mapper XML

**文件路径**: `cplm-pdm/.../mapper/{Name}Mapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.cvte.cplm.pdm.repository.{Name}Repository">

    <!-- 结果映射 -->
    <resultMap id="BaseResultMap" type="com.cvte.cplm.pdm.entity.{Name}Entity">
        <id column="id" property="id" jdbcType="BIGINT"/>
        <result column="name" property="name" jdbcType="VARCHAR"/>
        <result column="created_time" property="createdTime" jdbcType="TIMESTAMP"/>
    </resultMap>

    <!-- 基础列 -->
    <sql id="Base_Column_List">
        id, name, description, status, created_by, created_time, updated_by, updated_time
    </sql>

    <!-- 查询列表 -->
    <select id="selectByQuery" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM {table_name}
        <where>
            <if test="keyword != null and keyword != ''">
                AND (name LIKE CONCAT('%', #{keyword}, '%')
                     OR description LIKE CONCAT('%', #{keyword}, '%'))
            </if>
            <if test="status != null and status != ''">
                AND status = #{status}
            </if>
        </where>
        ORDER BY created_time DESC
    </select>

    <!-- 根据ID查询 -->
    <select id="selectById" resultMap="BaseResultMap">
        SELECT <include refid="Base_Column_List"/>
        FROM {table_name}
        WHERE id = #{id}
    </select>

    <!-- 插入 -->
    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO {table_name} (
            name, description, status, created_by, created_time
        ) VALUES (
            #{name}, #{description}, #{status}, #{createdBy}, NOW()
        )
    </insert>

    <!-- 更新 -->
    <update id="updateById">
        UPDATE {table_name}
        <set>
            <if test="name != null">name = #{name},</if>
            <if test="description != null">description = #{description},</if>
            updated_by = #{updatedBy},
            updated_time = NOW()
        </set>
        WHERE id = #{id}
    </update>

    <!-- 删除 -->
    <delete id="deleteById">
        DELETE FROM {table_name}
        WHERE id = #{id}
    </delete>

</mapper>
```

## 3. 实体类

**文件路径**: `cplm-pdm/.../entity/{Name}Entity.java`

```java
@Data
@TableName("{table_name}")
public class {Name}Entity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String status;

    private String createdBy;

    private LocalDateTime createdTime;

    private String updatedBy;

    private LocalDateTime updatedTime;
}
```

## 4. 业务逻辑说明

### 4.1 核心业务流程

1. **创建流程**:
   - 参数校验
   - 业务规则校验
   - 数据转换
   - 保存到数据库
   - 返回ID

2. **更新流程**:
   - 检查资源是否存在
   - 参数校验
   - 业务规则校验
   - 数据转换
   - 更新数据库

3. **删除流程**:
   - 检查资源是否存在
   - 检查是否可删除（关联数据检查）
   - 执行删除

### 4.2 事务管理

- 所有写操作（创建、更新、删除）使用 `@Transactional`
- 查询操作不使用事务
- 事务传播级别使用默认的 `REQUIRED`

### 4.3 异常处理

- 参数错误：抛出 `IllegalArgumentException`
- 业务错误：抛出 `BusinessException`
- 系统错误：抛出 `SystemException`

---

返回 [计划索引](./README.md)
