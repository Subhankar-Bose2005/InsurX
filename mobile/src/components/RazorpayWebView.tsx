import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  visible: boolean;
  orderId: string;
  amount: number;       // in paise
  keyId: string;
  workerName: string;
  workerPhone: string;
  description: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onFailure: (error: string) => void;
  onDismiss: () => void;
}

export default function RazorpayWebView({
  visible, orderId, amount, keyId, workerName, workerPhone,
  description, onSuccess, onFailure, onDismiss,
}: Props) {
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #EBF5FF; display: flex; align-items: center;
           justify-content: center; height: 100vh; font-family: sans-serif; }
    .msg { color: #1565C0; font-size: 16px; text-align: center; padding: 20px; }
    .err { color: #c0392b; font-size: 14px; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <p class="msg" id="status">Loading secure payment...</p>
  <script>
    function loadRazorpay() {
      var script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = function() { openCheckout(); };
      script.onerror = function() {
        document.getElementById('status').className = 'err';
        document.getElementById('status').innerText = 'Failed to load payment. Please check your internet connection.';
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILURE', error: 'Razorpay script failed to load' }));
      };
      document.head.appendChild(script);
    }

    function openCheckout() {
      try {
        var options = {
          key: "${keyId}",
          amount: ${amount},
          currency: "INR",
          name: "InsurX",
          description: "${description.replace(/"/g, "'")}",
          order_id: "${orderId}",
          prefill: {
            name: "${workerName.replace(/"/g, "'")}",
            contact: "${workerPhone}"
          },
          theme: { color: "#1565C0" },
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "SUCCESS",
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            }));
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: "DISMISS" }));
            },
            escape: false,
            backdropclose: false
          }
        };
        var rzp = new Razorpay(options);
        rzp.on("payment.failed", function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "FAILURE",
            error: response.error.description || "Payment failed"
          }));
        });
        rzp.open();
        document.getElementById('status').style.display = 'none';
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAILURE', error: e.message }));
      }
    }

    // Small delay to ensure WebView is fully ready
    setTimeout(loadRazorpay, 300);
  </script>
</body>
</html>`;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SUCCESS') {
        onSuccess(data.paymentId, data.orderId, data.signature);
      } else if (data.type === 'FAILURE') {
        onFailure(data.error);
      } else if (data.type === 'DISMISS') {
        onDismiss();
      }
    } catch (e) {
      console.warn('[RazorpayWebView] Failed to parse message', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {webViewLoading && (
          <View style={styles.loader}>
            <ActivityIndicator color="#1565C0" size="large" />
            <Text style={styles.loaderText}>Loading secure payment...</Text>
          </View>
        )}

        <WebView
          source={{ html }}
          onMessage={handleMessage}
          onLoadEnd={() => setWebViewLoading(false)}
          onError={(e) => {
            setWebViewLoading(false);
            onFailure('WebView failed to load: ' + e.nativeEvent.description);
          }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={[styles.webview, webViewLoading && { opacity: 0 }]}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF5FF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 48, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#BBDEFB',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#212121' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 20, color: '#546E7A' },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 12,
  },
  loaderText: { color: '#1565C0', fontSize: 14 },
  webview: { flex: 1 },
});