using System;
using System.Collections.Generic;
using System.Text;
using CommandLine;
using CommandLine.Text;

namespace OpsToolkit.Server
{
    class StartOptions
    {
        [Option('w', "way", Required = true, HelpText = "Which way the program run as.")]
        public string Way { get; set; }


        [Option('r', "read", HelpText = "Input file to be processed.")]
        public string InputFile { get; set; }

        [Option('v', "verbose", DefaultValue = true, HelpText = "Prints all messages to standard output.")]
        public bool Verbose { get; set; }

        [ParserState]
        public IParserState LastParserState { get; set; }

        [HelpOption]
        public string GetUsage()
        {
            return HelpText.AutoBuild(this, DefaultParsingErrorsHandler, false).ToString();
        }

        private void DefaultParsingErrorsHandler(HelpText current)
        {
            HelpText.DefaultParsingErrorsHandler(this, current);
        }

    }
}
