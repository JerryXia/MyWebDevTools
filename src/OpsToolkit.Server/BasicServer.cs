using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using HPSocketCS;

namespace OpsToolkit.Server
{
    public class BasicServer
    {
        HPSocketCS.TcpServer server;

        public BasicServer()
        {
            server = new HPSocketCS.TcpServer();
            try
            {
                // 设置服务器事件
                server.OnPrepareListen += new TcpServerEvent.OnPrepareListenEventHandler(OnPrepareListen);
                server.OnAccept += new TcpServerEvent.OnAcceptEventHandler(OnAccept);
                server.OnSend += new TcpServerEvent.OnSendEventHandler(OnSend);
                server.OnReceive += new TcpServerEvent.OnReceiveEventHandler(OnReceive);
                server.OnClose += new TcpServerEvent.OnCloseEventHandler(OnClose);
                server.OnError += new TcpServerEvent.OnErrorEventHandler(OnError);
                server.OnShutdown += new TcpServerEvent.OnShutdownEventHandler(OnShutdown);
            }
            catch (Exception ex)
            {
                Output.LogDefault(ex.Message);
            }
        }

        public void Start(string ip, ushort port)
        {
            try
            {
                server.IpAddress = ip;
                server.Port = port;
                // 启动服务
                if (server.Start())
                {
                    Output.LogDefault(string.Format("$Server Start OK -> ({0}:{1})", ip, port));
                }
                else
                {
                    throw new Exception(string.Format("$Server Start Error -> {0}({1})", server.ErrorMessage, server.ErrorCode));
                }
            }
            catch (Exception ex)
            {
                Output.LogDefault(ex.Message);
            }
        }

        public void Stop()
        {
            // 停止服务
            Output.LogDefault("$Server Stop");
            if (server.Stop())
            {
                
            }
            else
            {
                Output.LogDefault(string.Format("$Stop Error -> {0}({1})", server.ErrorMessage, server.ErrorCode));
            }
        }


        public void Disconn(int connectId)
        {
            try
            {
                IntPtr connId = (IntPtr)connectId;
                // 断开指定客户
                if (server.Disconnect(connId, true))
                {
                    Output.LogDefault(string.Format("$({0}) Disconnect OK", connId));
                }
                else
                {
                    throw new Exception(string.Format("Disconnect({0}) Error", connId));
                }
            }
            catch (Exception ex)
            {
                Output.LogDefault(ex.Message);
            }
        }

        public void Close()
        {
            server.Destroy();
        }


        HandleResult OnPrepareListen(IntPtr soListen)
        {
            // 监听事件到达了,一般没什么用吧?

            return HandleResult.Ok;
        }

        HandleResult OnAccept(IntPtr connId, IntPtr pClient)
        {
            // 客户进入了


            // 获取客户端ip和端口
            string ip = string.Empty;
            ushort port = 0;
            if (server.GetRemoteAddress(connId, ref ip, ref port))
            {
                Output.LogDefault(string.Format(" > [{0},OnAccept] -> PASS({1}:{2})", connId, ip.ToString(), port));
            }
            else
            {
                Output.LogDefault(string.Format(" > [{0},OnAccept] -> Server_GetClientAddress() Error", connId));
            }


            // 设置附加数据
            ClientInfo ci = new ClientInfo();
            ci.ConnId = connId;
            ci.IpAddress = ip;
            ci.Port = port;
            if (server.SetConnectionExtra(connId, ci) == false)
            {
                Output.LogDefault(string.Format(" > [{0},OnAccept] -> SetConnectionExtra fail", connId));
            }

            return HandleResult.Ok;
        }

        HandleResult OnSend(IntPtr connId, IntPtr pData, int length)
        {
            // 服务器发数据了


            Output.LogDefault(string.Format(" > [{0},OnSend] -> ({1} bytes)", connId, length));

            return HandleResult.Ok;
        }

        HandleResult OnReceive(IntPtr connId, IntPtr pData, int length)
        {
            // 数据到达了
            try
            {
                // 从pData中获取字符串
                // string str = Marshal.PtrToStringAnsi(pData, length);

                // intptr转byte[]
                // byte[] bytes = new byte[length];
                // Marshal.Copy(pData, bytes, 0, length);


                // 获取附加数据
                IntPtr clientPtr = IntPtr.Zero;
                if (server.GetConnectionExtra(connId, ref clientPtr))
                {
                    // ci 就是accept里传入的附加数据了
                    ClientInfo ci = (ClientInfo)Marshal.PtrToStructure(clientPtr, typeof(ClientInfo));
                    Output.LogDefault(string.Format(" > [{0},OnReceive] -> {1}:{2} ({3} bytes)", ci.ConnId, ci.IpAddress, ci.Port, length));
                }
                else
                {
                    Output.LogDefault(string.Format(" > [{0},OnReceive] -> ({1} bytes)", connId, length));
                }

                if (server.Send(connId, pData, length))
                {
                    return HandleResult.Ok;
                }

                return HandleResult.Error;
            }
            catch (Exception)
            {

                return HandleResult.Ignore;
            }
        }

        HandleResult OnClose(IntPtr connId)
        {
            // 客户离开了


            // 释放附加数据
            if (server.SetConnectionExtra(connId, null) == false)
            {
                Output.LogDefault(string.Format(" > [{0},OnClose] -> SetConnectionExtra({0}, null) fail", connId));
            }


            Output.LogDefault(string.Format(" > [{0},OnClose]", connId));
            return HandleResult.Ok;
        }

        HandleResult OnError(IntPtr connId, SocketOperation enOperation, int errorCode)
        {
            // 客户出错了
            Output.LogDefault(string.Format(" > [{0},OnError] -> OP:{1},CODE:{2}", connId, enOperation, errorCode));
            // return HPSocketSdk.HandleResult.Ok;

            // 因为要释放附加数据,所以直接返回OnClose()了
            return OnClose(connId);
        }

        HandleResult OnShutdown()
        {
            // 服务关闭了
            Output.LogDefault(" > [OnShutdown]");
            return HandleResult.Ok;
        }

    }
    [StructLayout(LayoutKind.Sequential)]
    public class ClientInfo
    {
        public IntPtr ConnId { get; set; }
        public string IpAddress { get; set; }
        public ushort Port { get; set; }
    }

}
