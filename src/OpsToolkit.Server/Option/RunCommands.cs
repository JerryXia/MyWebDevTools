using System;
using System.Collections.Generic;
using System.Text;
using CommandLine;

namespace OpsToolkit.Server
{
    class RunCommands
    {
        [Option('q', "query", DefaultValue = "", HelpText = "Query Data Field")]
        public string Query { get; set; }


        [HelpOption]
        public string GetUsage()
        {
            var usage = new StringBuilder();
            usage.AppendLine("Options:");
            usage.AppendLine("count: reutrn current total connections count");
            return usage.ToString();
        }
    }
}
