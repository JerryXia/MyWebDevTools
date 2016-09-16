using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using System.Text;
using System.Threading.Tasks;
using HPSocketCS;
using HPSocketCS.SDK;

namespace OpsTookit.Client
{
    class Program
    {
        static HPSocketCS.TcpClient client = new HPSocketCS.TcpClient();

        static void Main(string[] args)
        {
            try
            {
                // 设置client事件
                client.OnPrepareConnect += new TcpClientEvent.OnPrepareConnectEventHandler(OnPrepareConnect);
                client.OnConnect += new TcpClientEvent.OnConnectEventHandler(OnConnect);
                client.OnSend += new TcpClientEvent.OnSendEventHandler(OnSend);
                client.OnReceive += new TcpClientEvent.OnReceiveEventHandler(OnReceive);
                client.OnClose += new TcpClientEvent.OnCloseEventHandler(OnClose);
                client.OnError += new TcpClientEvent.OnErrorEventHandler(OnError);
            }
            catch (Exception ex)
            {
                AddMsg(ex.Message);
            }

            String ip = "127.0.0.1";
            ushort port = 40488;


            AddMsg(string.Format("$Client Starting ... -> ({0}:{1})", ip, port));

            if (client.Connetion(ip, port, true))
            {
                AddMsg(string.Format("$Client Start OK -> ({0}:{1})", ip, port));
            }
            else
            {
                throw new Exception(string.Format("$Client Start Error -> {0}({1})", client.ErrorMessage, client.ErrorCode));
            }

            Console.ReadKey();
        }


        static void AddMsg(string msg)
        {
            Console.WriteLine(msg);
        }

        static HandleResult OnPrepareConnect(TcpClient sender, uint socket)
        {
            return HandleResult.Ok;
        }

        static HandleResult OnConnect(TcpClient sender)
        {
            // 已连接 到达一次

            // 如果是异步联接,更新界面状态
            //this.Invoke(new ConnectUpdateUiDelegate(ConnectUpdateUi));

            AddMsg(string.Format(" > [{0},OnConnect]", sender.ConnectionId));

            return HandleResult.Ok;
        }

        static HandleResult OnSend(TcpClient sender, IntPtr pData, int length)
        {
            // 客户端发数据了
            AddMsg(string.Format(" > [{0},OnSend] -> ({1} bytes)", sender.ConnectionId, length));

            return HandleResult.Ok;
        }

        static HandleResult OnReceive(TcpClient sender, IntPtr pData, int length)
        {
            // 数据到达了
            //if (isSendFile == true)
            //{
            //    // 如果发送了文件,并接收到了返回数据
            //    isSendFile = false;
            //    MyFileInfo myFile = (MyFileInfo)Marshal.PtrToStructure(pData, typeof(MyFileInfo));
            //    int objSize = Marshal.SizeOf(myFile);
            //    // 因为没有附加尾数据,所以大小可以用length - objSize
            //    byte[] bytes = new byte[length - objSize];
            //    Marshal.Copy(pData + objSize, bytes, 0, length - objSize);

            //    string txt = Encoding.Default.GetString(bytes);
            //    string msg = string.Empty;
            //    if (txt.Length > 100)
            //    {
            //        msg = txt.Substring(0, 100) + "......";
            //    }
            //    else
            //    {
            //        msg = txt;
            //    }

            //    AddMsg(string.Format(" > [{0},OnReceive] -> FileInfo(Path:\"{1}\",Size:{2})", sender.ConnectionId, myFile.FilePath, myFile.FileSize));
            //    AddMsg(string.Format(" > [{0},OnReceive] -> FileContent(\"{1}\")", sender.ConnectionId, msg));
            //}
            //else if (studentType != StudentType.None)
            //{
            //    byte[] bytes = new byte[length];
            //    Marshal.Copy(pData, bytes, 0, length);

            //    switch (studentType)
            //    {
            //        case StudentType.Array:
            //            Student[] students = sender.BytesToObject(bytes) as Student[];
            //            foreach (var stu in students)
            //            {
            //                AddMsg(string.Format(" > [{0},OnReceive] -> Student({1},{2},{3})", sender.ConnectionId, stu.Id, stu.Name, stu.GetSexString()));
            //            }
            //            break;
            //        case StudentType.List:
            //            List<Student> stuList = sender.BytesToObject(bytes) as List<Student>;
            //            foreach (var stu in stuList)
            //            {
            //                AddMsg(string.Format(" > [{0},OnReceive] -> Student({1},{2},{3})", sender.ConnectionId, stu.Id, stu.Name, stu.GetSexString()));
            //            }
            //            break;
            //        case StudentType.Single:
            //            Student student = sender.BytesToObject(bytes) as Student;
            //            AddMsg(string.Format(" > [{0},OnReceive] -> Student({1},{2},{3})", sender.ConnectionId, student.Id, student.Name, student.GetSexString()));
            //            studentType = StudentType.None;
            //            break;
            //    }
            //}
            //else
            //{
            //    AddMsg(string.Format(" > [{0},OnReceive] -> ({1} bytes)", sender.ConnectionId, length));
            //}
            AddMsg(string.Format(" > [{0},OnReceive] -> ({1} bytes)", sender.ConnectionId, length));
            return HandleResult.Ok;
        }

        static HandleResult OnClose(TcpClient sender)
        {
            // 连接关闭了

            AddMsg(string.Format(" > [{0},OnClose]", sender.ConnectionId));

            // 通知界面
            //this.Invoke(new SetAppStateDelegate(SetAppState), AppState.Stoped);
            return HandleResult.Ok;
        }

        static HandleResult OnError(TcpClient sender, SocketOperation enOperation, int errorCode)
        {
            // 出错了

            AddMsg(string.Format(" > [{0},OnError] -> OP:{1},CODE:{2}", sender.ConnectionId, enOperation, errorCode));

            // 通知界面,只处理了连接错误,也没进行是不是连接错误的判断,所以有错误就会设置界面
            // 生产环境请自己控制
            //this.Invoke(new SetAppStateDelegate(SetAppState), AppState.Stoped);

            return HandleResult.Ok;
        }
    }
}
