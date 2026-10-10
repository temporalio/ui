export { Namespace } from '../en/search-attributes';

export const Strings = {
  // Component headers and labels
  title: '搜索属性',
  description:
    '为工作流查询定义自定义搜索属性。有关搜索属性类型的更多信息，请阅读',
  'docs-link': '搜索属性文档',
  'column-attribute': '属性',
  'column-type': '类型',
  'attribute-label': '属性 {{index}}',
  'type-label': '属性 {{index}} 的类型',
  'select-type-placeholder': '选择类型',
  'custom-search-attributes': '自定义搜索属性',
  'cloud-delete-tooltip': '如需删除搜索属性，请提交支持工单。',

  // Buttons
  'add-attribute-button': '添加新的自定义搜索属性',
  'save-button': '保存',
  'saving-button': '保存中...',
  'cancel-button': '取消',

  // Messages
  'validation-error-title': '校验错误',
  'save-success': '搜索属性保存成功',
  'save-error': '保存搜索属性失败',
  'save-error-generic': '保存搜索属性时发生错误',
  'load-error-title': '加载搜索属性失败',
  'error-title': '错误',

  // Validation messages
  'validation-name-required': '属性名称为必填项',
  'validation-names-unique': '属性名称必须唯一',

  // Development messages
  'crud-not-implemented': '待 SDK 团队添加端点后将实现 CRUD 操作',

  // Type labels
  'type-keyword': '关键词',
  'type-text': '文本',
  'type-int': '整数',
  'type-double': '双精度浮点数',
  'type-bool': '布尔值',
  'type-datetime': '日期时间',
  'type-keywordlist': '关键词列表',

  // Story titles
  'story-title': '{{namespace}} 的自定义搜索属性',
} as const;
