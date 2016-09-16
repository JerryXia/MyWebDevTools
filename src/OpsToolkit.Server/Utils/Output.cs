using System;
using System.Collections.Generic;
using System.Text;

namespace OpsToolkit.Server
{
    public static class Output
    {
        public static void WriteLine(string value)
        {
            Console.WriteLine(value);
        }

        public static void LogDefault(string message)
        {
            Log.DefaultLogger.Info(message);
        }

    }
}
