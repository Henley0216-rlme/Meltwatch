/**
 * Emotion Widget - 可嵌入脚本
 * 
 * 使用方式：
 * 1. 在页面中引入: <script src="emotion-widget.js"></script>
 * 2. 添加容器: <div id="emotion-widget"></div>
 * 
 * 自定义配置:
 * <script>
 *   window.EmotionWidgetConfig = {
 *     apiBase: 'https://your-api-domain.com/api/v1',
 *     theme: 'light' | 'dark',
 *     position: 'bottom-right' | 'bottom-left'
 *   };
 * </script>
 */

(function() {
  'use strict';

  // 默认配置
  const defaultConfig = {
    apiBase: 'http://localhost:5000/api/v1',
    theme: 'light',
    position: 'bottom-right',
    buttonText: '情绪分析',
    placeholder: '输入评价文本...'
  };

  // 获取配置
  const config = Object.assign({}, defaultConfig, window.EmotionWidgetConfig || {});

  // 样式
  const styles = `
    .emotion-widget-float-btn {
      position: fixed;
      ${config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 24px;
    }
    
    .emotion-widget-float-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
    }
    
    .emotion-widget-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: none;
      justify-content: center;
      align-items: center;
    }
    
    .emotion-widget-modal.show {
      display: flex;
    }
    
    .emotion-widget-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .emotion-widget-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .emotion-widget-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
    
    .emotion-widget-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 5px;
    }
    
    .emotion-widget-body {
      padding: 20px;
    }
    
    .emotion-widget-textarea {
      width: 100%;
      height: 100px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      resize: vertical;
      margin-bottom: 15px;
      font-family: inherit;
    }
    
    .emotion-widget-textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .emotion-widget-submit {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    .emotion-widget-submit:hover {
      opacity: 0.9;
    }
    
    .emotion-widget-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .emotion-widget-result {
      margin-top: 20px;
      display: none;
    }
    
    .emotion-widget-result.show {
      display: block;
    }
    
    .emotion-widget-primary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 600;
    }
    
    .emotion-widget-primary.positive { background: #e8f5e9; color: #2e7d32; }
    .emotion-widget-primary.neutral { background: #e3f2fd; color: #1565c0; }
    .emotion-widget-primary.negative { background: #fff3e0; color: #e65100; }
    .emotion-widget-primary.critical { background: #ffebee; color: #c62828; }
    
    .emotion-widget-suggestion {
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
    }
    
    .emotion-widget-loading {
      text-align: center;
      padding: 20px;
      display: none;
    }
    
    .emotion-widget-loading.show {
      display: block;
    }
    
    .emotion-widget-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #e0e0e0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: emotion-widget-spin 1s linear infinite;
      margin: 0 auto 10px;
    }
    
    @keyframes emotion-widget-spin {
      to { transform: rotate(360deg); }
    }
    
    .emotion-widget-error {
      padding: 12px;
      background: #ffebee;
      color: #c62828;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 15px;
      display: none;
    }
    
    .emotion-widget-error.show {
      display: block;
    }
  `;

  // 创建样式
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // 创建浮窗按钮
  function createFloatButton() {
    const btn = document.createElement('button');
    btn.className = 'emotion-widget-float-btn';
    btn.innerHTML = '🧠';
    btn.title = config.buttonText;
    btn.onclick = openModal;
    document.body.appendChild(btn);
  }

  // 创建模态框
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'emotion-widget-modal';
    modal.id = 'emotion-widget-modal';
    modal.onclick = function(e) {
      if (e.target === modal) closeModal();
    };
    
    modal.innerHTML = `
      <div class="emotion-widget-content">
        <div class="emotion-widget-header">
          <h3>🧠 情绪识别</h3>
          <button class="emotion-widget-close" onclick="window.closeEmotionWidgetModal()">×</button>
        </div>
        <div class="emotion-widget-body">
          <textarea 
            class="emotion-widget-textarea" 
            id="emotion-widget-input"
            placeholder="${config.placeholder}"
          ></textarea>
          <button class="emotion-widget-submit" id="emotion-widget-submit">
            开始分析
          </button>
          <div class="emotion-widget-loading" id="emotion-widget-loading">
            <div class="emotion-widget-spinner"></div>
            <p>分析中...</p>
          </div>
          <div class="emotion-widget-error" id="emotion-widget-error"></div>
          <div class="emotion-widget-result" id="emotion-widget-result">
            <div class="emotion-widget-primary" id="emotion-widget-primary"></div>
            <div class="emotion-widget-suggestion" id="emotion-widget-suggestion"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定事件
    document.getElementById('emotion-widget-submit').onclick = analyzeText;
    document.getElementById('emotion-widget-input').onkeydown = function(e) {
      if (e.ctrlKey && e.key === 'Enter') analyzeText();
    };
    
    // 全局函数
    window.closeEmotionWidgetModal = closeModal;
  }

  function openModal() {
    document.getElementById('emotion-widget-modal').classList.add('show');
    document.getElementById('emotion-widget-input').focus();
  }

  function closeModal() {
    document.getElementById('emotion-widget-modal').classList.remove('show');
  }

  async function analyzeText() {
    const input = document.getElementById('emotion-widget-input');
    const text = input.value.trim();
    
    if (!text) {
      showError('请输入要分析的文本');
      return;
    }
    
    const submitBtn = document.getElementById('emotion-widget-submit');
    const loading = document.getElementById('emotion-widget-loading');
    const error = document.getElementById('emotion-widget-error');
    const result = document.getElementById('emotion-widget-result');
    
    submitBtn.disabled = true;
    loading.classList.add('show');
    error.classList.remove('show');
    result.classList.remove('show');
    
    try {
      const response = await fetch(`${config.apiBase}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (data.success) {
        displayResult(data.data);
      } else {
        showError(data.error || '分析失败');
      }
    } catch (err) {
      showError('网络错误，请检查连接');
    } finally {
      submitBtn.disabled = false;
      loading.classList.remove('show');
    }
  }

  function displayResult(data) {
    const emotion = data.emotion;
    
    const primaryEl = document.getElementById('emotion-widget-primary');
    primaryEl.className = `emotion-widget-primary ${emotion.category}`;
    primaryEl.innerHTML = `<span>${emotion.icon}</span><span>${emotion.label}</span><span style="margin-left: auto; font-size: 14px;">${(emotion.score * 100).toFixed(1)}%</span>`;
    
    document.getElementById('emotion-widget-suggestion').textContent = data.suggestion;
    document.getElementById('emotion-widget-result').classList.add('show');
  }

  function showError(message) {
    const errorEl = document.getElementById('emotion-widget-error');
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }

  // 初始化
  function init() {
    injectStyles();
    createFloatButton();
    createModal();
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();