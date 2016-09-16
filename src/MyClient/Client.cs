using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace MyClient
{
    public class client
    {

        public TcpClient _client;

        public int port;

        public IPAddress remote;

        public client(int port, IPAddress remote)
        {

            this.port = port;
            this.remote = remote;
        }

        public void connect()
        {
            this._client = new TcpClient();
            _client.Connect(remote, port);
        }
        public void disconnect()
        {
            _client.Close();
        }
        public void send(string msg)
        {
            byte[] data = Encoding.Default.GetBytes(msg);
            _client.GetStream().Write(data, 0, data.Length);
        }
    }
}
