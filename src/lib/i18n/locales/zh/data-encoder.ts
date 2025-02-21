export const Namespace = 'data-encoder' as const;

export const Strings = {
  'codec-server': '编解码服务器',
  'endpoint-title': '编解码服务器浏览器端点',
  'endpoint-description':
    '为此浏览器输入一个编解码服务器端点。这将在您的浏览器中存储，并且只有您才能访问。',
  'endpoint-placeholder': '在此粘贴您的端点',
  'pass-access-token-label': '传递用户访问令牌',
  'include-cross-origin-credentials-label': '包含跨源凭据',
  'include-cross-origin-credentials-warning':
    '警告：预飞行检查将被执行，如果配置不正确可能导致解码失败。',
  'port-title': 'tctl插件端口',
  'port-info': '如果两者都设置，将使用编解码服务器端点。',
  'access-token-https-error':
    '如果传递访问令牌，端点必须是以https://开头',
  'prefix-error': '端点必须以http:// 或 https:// 开头',
  'codec-server-description-prefix': '',
  'codec-server-description-suffix':
    '用于编解码您的数据。编解码服务器端点可以在{{level}}级别上设置，或者在您的浏览器中单独本地设置。',
  'browser-override-description':
    '使用我的浏览器设置并忽略{{level}}级别的设置。',
  'no-browser-override-description':
    '使用{{level}}级别的设置，如果可用的话。',
  'codec-server-configured': '编解码服务器已配置',
  'codec-server-error': '无法连接到编解码服务器',
  'codec-server-success': '编解码服务器成功转换内容',
  'configure-codec-server': '配置编解码服务器',
  'encode-error': '编解码服务器编码失败',
} as const;
