document.addEventListener('DOMContentLoaded', function () {
  // Material Design Webコンポーネントの初期化
  initializeMDC();

  // イベントリスナーの設定
  setupEventListeners();

  // 初期状態でコマンドラインを生成
  generateCommandLine();
});

// Material Design Webコンポーネントの初期化
function initializeMDC() {
  // トップアプリバーの初期化
  const topAppBarElement = document.querySelector('.mdc-top-app-bar');
  if (topAppBarElement) {
    mdc.topAppBar.MDCTopAppBar.attachTo(topAppBarElement);
  }

  // タブバーの初期化
  const tabBar = document.querySelector('.mdc-tab-bar');
  if (tabBar) {
    const tabBarInstance = mdc.tabBar.MDCTabBar.attachTo(tabBar);

    tabBarInstance.listen('MDCTabBar:activated', function (event) {
      // すべてのタブコンテンツを非表示
      document.querySelectorAll('.tab-content').forEach(function (content) {
        content.classList.add('hidden');
      });

      // 選択されたタブのコンテンツを表示
      const tabIds = ['basic', 'log', 'network', 'audio', 'video', 'other'];
      const selectedTabId = tabIds[event.detail.index];
      document.getElementById('content-' + selectedTabId).classList.remove('hidden');
    });
  }

  // ラジオボタンの初期化
  document.querySelectorAll('.mdc-radio').forEach(function (radio) {
    mdc.radio.MDCRadio.attachTo(radio);
  });

  // スイッチの初期化
  document.querySelectorAll('.mdc-switch').forEach(function (switchEl) {
    mdc.switchControl.MDCSwitch.attachTo(switchEl);
  });

  // テキストフィールドの初期化
  document.querySelectorAll('.mdc-text-field').forEach(function (textField) {
    mdc.textField.MDCTextField.attachTo(textField);
  });


  // ボタンの初期化
  document.querySelectorAll('.mdc-button').forEach(function (button) {
    mdc.ripple.MDCRipple.attachTo(button);
  });
}

// イベントリスナーの設定
function setupEventListeners() {
  // プラットフォーム選択の変更イベント
  document.querySelectorAll('input[name="platform"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      updatePlatformSpecificOptions();
      generateCommandLine();
    });
  });

  // フォーム要素の変更イベント
  document.querySelectorAll('input, select').forEach(function (input) {
    input.addEventListener('change', generateCommandLine);
    if (input.type === 'text' || input.type === 'number') {
      input.addEventListener('input', generateCommandLine);
    }
  });

  // コピーボタンのクリックイベント
  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.addEventListener('click', function () {
      const commandLine = document.getElementById('command-output');
      if (commandLine) {
        navigator.clipboard.writeText(commandLine.textContent)
          .then(function () {
            showSnackbar('コマンドラインをコピーしました');
          })
          .catch(function (err) {
            console.error('コピーに失敗しました:', err);
            showSnackbar('コピーに失敗しました');
          });
      }
    });
  }

  // ダウンロードボタンのクリックイベント
  const downloadButton = document.getElementById('download-button');
  if (downloadButton) {
    downloadButton.addEventListener('click', function () {
      const commandLine = document.getElementById('command-output');
      if (commandLine && commandLine.textContent) {
        const blob = new Blob([commandLine.textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CloudXRLaunchOptions.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        showSnackbar('コマンドラインが空です');
      }
    });
  }

}

// プラットフォーム固有のオプションの表示/非表示を更新
function updatePlatformSpecificOptions() {
  const selectedPlatform = document.querySelector('input[name="platform"]:checked').value;

  document.querySelectorAll('.platform-specific').forEach(function (element) {
    const platforms = element.dataset.platform.split(' ');

    if (selectedPlatform === 'all' || platforms.includes(selectedPlatform)) {
      element.style.display = '';
    } else {
      element.style.display = 'none';
    }
  });
}

// コマンドラインの生成
function generateCommandLine() {
  const commandParts = [];
  const selectedPlatform = document.querySelector('input[name="platform"]:checked').value;

  // サーバーIPアドレス
  const serverIp = document.getElementById('server-ip').value;
  if (serverIp) {
    commandParts.push('-server ' + serverIp);
  }

  // チェックボックスとスイッチの処理
  document.querySelectorAll('.mdc-switch').forEach(function (switchEl) {
    const input = switchEl.querySelector('input[type="checkbox"]');
    if (input && input.checked) {
      const option = switchEl.closest('[data-option]').dataset.option;

      // プラットフォーム固有のオプションの場合、プラットフォームをチェック
      const optionItem = switchEl.closest('.platform-specific');
      if (!optionItem || selectedPlatform === 'all' || optionItem.dataset.platform.split(' ').includes(selectedPlatform)) {
        commandParts.push(option);
      }
    }
  });

  // テキストフィールドとナンバーフィールドの処理
  document.querySelectorAll('.mdc-text-field').forEach(function (textField) {
    const input = textField.querySelector('input');
    if (input && input.value) {
      const option = textField.dataset.option;

      // プラットフォーム固有のオプションの場合、プラットフォームをチェック
      const optionItem = textField.closest('.platform-specific');
      if (!optionItem || selectedPlatform === 'all' || optionItem.dataset.platform.split(' ').includes(selectedPlatform)) {
        commandParts.push(option + ' ' + input.value);
      }
    }
  });

  // セレクトボックスの処理
  document.querySelectorAll('.select-container').forEach(function (container) {
    const select = container.querySelector('select');
    if (select && select.value) {
      const option = container.dataset.option;
      commandParts.push(option + ' ' + select.value);
    }
  });

  // 出力エリアに表示
  const commandOutput = document.getElementById('command-output');
  if (commandOutput) {
    commandOutput.textContent = commandParts.join(' ');
  }
}

// スナックバーの表示
function showSnackbar(message) {
  const snackbar = document.getElementById('snackbar');
  if (snackbar) {
    snackbar.textContent = message;
    snackbar.classList.add('show');

    setTimeout(function () {
      snackbar.classList.remove('show');
    }, 3000);
  }
}
