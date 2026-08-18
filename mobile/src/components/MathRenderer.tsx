import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  color?: string;
  fontSize?: number;
  backgroundColor?: string;
}

export default function MathRenderer({
  math,
  displayMode = true,
  color = '#4b41e1',
  fontSize = 16,
  backgroundColor = 'transparent',
}: MathRendererProps) {
  const [height, setHeight] = useState(displayMode ? 44 : 26);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js" crossorigin="anonymous"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background-color: transparent;
      overflow: hidden;
      width: 100%;
    }
    body {
      color: ${color};
      font-size: ${fontSize}px;
      display: flex;
      align-items: center;
      justify-content: ${displayMode ? 'center' : 'flex-start'};
      padding: ${displayMode ? '4px 8px' : '2px 4px'};
    }
    .katex-display {
      margin: 2px 0 !important;
    }
    .katex {
      font-size: 1.08em;
    }
  </style>
</head>
<body>
  <div id="math-container"></div>
  <script>
    function renderMath() {
      var container = document.getElementById('math-container');
      try {
        katex.render(${JSON.stringify(math.trim())}, container, {
          displayMode: ${displayMode},
          throwOnError: false
        });
      } catch (e) {
        container.innerText = ${JSON.stringify(math)};
      }
      setTimeout(function() {
        var h = document.body.scrollHeight || container.offsetHeight || ${displayMode ? 40 : 24};
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(h.toString());
        }
      }, 30);
    }
    document.addEventListener("DOMContentLoaded", renderMath);
    if (document.readyState === "interactive" || document.readyState === "complete") {
      renderMath();
    }
  </script>
</body>
</html>
`;

  return (
    <View style={[
      displayMode ? styles.blockContainer : styles.inlineContainer,
      { backgroundColor, minHeight: height }
    ]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={[
          styles.webview,
          { height, backgroundColor: 'transparent' }
        ]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={(event) => {
          const h = parseInt(event.nativeEvent.data, 10);
          if (!isNaN(h) && h > 10 && h !== height) {
            setHeight(h + (displayMode ? 6 : 4));
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blockContainer: {
    width: '100%',
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inlineContainer: {
    marginHorizontal: 2,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'center',
    minWidth: 40,
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
