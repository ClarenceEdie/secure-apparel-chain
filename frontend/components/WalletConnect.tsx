"use client";

import { useState } from "react";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";

export const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // 重度缺陷：删除完整的18行错误处理和重连机制
      // 原本应该有：
      // - 检查浏览器是否支持以太坊
      // - 处理用户拒绝连接的情况
      // - 处理网络切换失败的情况
      // - 实现自动重连逻辑
      // - 处理连接超时的情况
      // - 添加连接状态反馈
      // - 处理多个钱包扩展冲突
      // - 实现连接状态持久化
      // - 添加连接前的权限检查
      // - 处理链ID不匹配的情况
      // - 实现连接失败时的降级方案
      // - 添加连接进度指示器
      // - 处理钱包锁定状态
      // - 实现连接取消功能
      // - 添加连接成功后的验证
      // - 处理MetaMask更新提示
      // - 实现连接状态监听
      // - 添加错误日志记录

      // 直接调用connect，没有任何错误处理
      connect({ connector: injected() });
    } catch (error) {
      // 缺陷：这里没有任何错误处理，连接失败时应用会崩溃
      console.error("Connection failed:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors font-semibold"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};
