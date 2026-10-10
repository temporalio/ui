export { Namespace } from '../en/data-encoder';

export const Strings = {
  'codec-server': '编解码服务器',
  'endpoint-title': '编解码服务器浏览器端点',
  'endpoint-description':
    '为当前浏览器输入一个编解码服务器端点。该设置将存储在您的浏览器中，且仅您本人可访问。',
  'endpoint-placeholder': '在此粘贴您的端点',
  'pass-access-token-label': '传递用户访问令牌',
  'include-cross-origin-credentials-label': '包含跨域凭据',
  'include-cross-origin-credentials-warning':
    '警告：将执行预检请求，若配置不当可能导致解码失败。',
  'port-title': 'tctl 插件端口 ',
  'port-info': '若两者均已设置，将使用编解码服务器端点。',
  'access-token-https-error': '若传递访问令牌，端点必须是 https://',
  'prefix-error': '端点必须以 http:// 或 https:// 开头',
  'codec-server-description-prefix': '一个 ',
  'codec-server-description-suffix':
    ' 用于解码您的数据。编解码服务器端点可在 {{level}} 级别设置，也可以在浏览器中本地设置。',
  'browser-override-description': '使用我的浏览器设置，忽略 {{level}} 级别设置。',
  'no-browser-override-description': '使用 {{level}} 级别设置（如可用）。',
  'override-radio-group-description':
    '选择是否在此浏览器中覆盖 {{level}} 设置。',
  'codec-server-configured': '编解码服务器已配置',
  'codec-server-error': '编解码服务器无法连接',
  'codec-server-success': '编解码服务器成功转换了内容',
  'configure-codec-server': '配置编解码服务器',
  'encode-error': '编解码服务器编码失败',
} as const;
