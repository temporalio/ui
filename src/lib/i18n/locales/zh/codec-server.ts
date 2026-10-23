export { Namespace } from '../en/codec-server';

export const Strings = {
  title: '编解码服务器',
  description: '通过端点远程解码您的数据。',
  'info-message':
    '用户可以使用此命名空间级编解码服务器端点，也可以在浏览器中改用其他端点。',
  'endpoint-description-prefix': '请输入一个 ',
  'endpoint-link-text': '编解码服务器端点',
  'endpoint-description-suffix':
    ' 以便为与此命名空间交互的用户解码负载',
  'endpoint-label': '编解码服务器端点',
  'endpoint-placeholder': 'https://your-codec-server.com/api/v1',
  'pass-access-token-label': '传递用户访问令牌',
  'pass-access-token-description':
    '在向编解码服务器发送请求时附带用户的访问令牌',
  'cross-origin-credentials-label': '包含跨域凭据',
  'cross-origin-credentials-description':
    '向编解码服务器发起跨域请求时包含凭据',
  'custom-section-description':
    '可选：自定义错误消息，并在编解码服务器失败时为用户提供跳转链接。',
  'add-custom-button': '添加自定义消息和链接',
  'custom-message-label': '自定义错误消息',
  'custom-message-placeholder': '输入自定义错误消息…',
  'custom-link-label': '自定义错误链接',
  'custom-link-placeholder': 'https://your-help-docs.com/codec-errors',
  'custom-link-description':
    '仅添加可信链接。此 URL 会展示给最终用户，且应指向安全的目标地址，以应对编解码服务器故障。',
  'remove-custom-button': '移除自定义消息和链接',
  'validation-error-title': '校验错误',
  'validation-endpoint-required': '端点为必填项',
  'validation-endpoint-url': '请输入有效的 URL',
  'validation-custom-link-url': '请输入有效的 URL',
  'save-button': '保存',
  'saving-button': '保存中…',
  'cancel-button': '取消',
  'save-success': '编解码服务器配置保存成功',
  'load-error-title': '加载编解码服务器设置失败',
} as const;
