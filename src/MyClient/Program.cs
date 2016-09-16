using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using UdpServer;

namespace MyClient
{
    class Program
    {
        static void Main(string[] args)
        {
            string s = System.Console.ReadLine();
            if (s == "s")
            {
                IOCPServer server = new IOCPServer(8088, 1024);
                server.Start();
                Console.WriteLine("服务器已启动....");
                System.Console.ReadLine();
            }
            else if(s == "c")
            {
                IPAddress remote = IPAddress.Parse("127.0.0.1");
                client c = new client(8088, remote);

                c.connect();
                Console.WriteLine("服务器连接成功!");
                while (true)
                {
                    Console.Write("send>");
                    string msg = Console.ReadLine();
                    if (msg == "exit")
                        break;
                    c.send(msg);
                }
                c.disconnect();
                Console.ReadLine();
            }
            else
            {
            
            }

           

        }
    }
}
