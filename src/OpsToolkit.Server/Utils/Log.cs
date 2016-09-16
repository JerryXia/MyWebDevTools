using System;

namespace OpsToolkit.Server
{
    public static class Log
    {
        private static readonly NLog.Logger defaultLogger;

        static Log()
        {
            defaultLogger = NLog.LogManager.GetLogger("default");
        }

        public static NLog.Logger DefaultLogger
        {
            get
            {
                return defaultLogger;
            }
        }


    }

    //public interface ILogProvider
    //{
        
    //}
    //public class NLogProvider : ILogProvider
    //{

    //}
}
