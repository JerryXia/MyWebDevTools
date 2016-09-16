using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace OpsToolkit.Server
{
    public delegate void AppAction();

    class Program
    {
        static void Main(string[] args)
        {
            var startOptions = new StartOptions();
            if (CommandLine.Parser.Default.ParseArguments(PreProcessArgs(args), startOptions))
            {
                var basicServer = new BasicServer();
                basicServer.Start("0.0.0.0", 40488);

                #region Command Query

                while(true)
                {
                    string inputCommand = Console.ReadLine();
                    string[] inputCommands = { inputCommand };
                    var runCommands = new RunCommands();
                    if (CommandLine.Parser.Default.ParseArguments(inputCommands, runCommands))
                    {
                        #if DEBUG
                        Output.WriteLine(runCommands.Query);
                        #endif
                        switch (runCommands.Query)
                        {
                            case "count":
                                break;
                            case "stop":
                                basicServer.Stop();
                                break;
                            case "exit":
                                basicServer.Close();
                                goto ApplicationEnd;
                            default:
                                Output.WriteLine("Invalid Command!");
                                break;
                        }
                    }
                    else
                    {
                        Output.WriteLine("RunCommand Parse Fail.");
                    }
                }
                #endregion
            }
            else
            {
                Output.WriteLine("StartOptions Parse Fail.");
            }
        ApplicationEnd:
            ProcessCommand(null);

        Output.WriteLine("End");
        }

        static string[] PreProcessArgs(string[] args)
        {
            if (args == null || args.Length == 0)
            {
                string[] newArgs = { "--way=explicit" };
                return newArgs;
            }
            return args;
        }

        static void ProcessCommand(AppAction action)
        {
            if (action != null)
            {
                action();
            }
        }

    }
}
