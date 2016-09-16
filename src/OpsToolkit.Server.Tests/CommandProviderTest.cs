using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace OpsToolkit.Server.Tests
{
    [TestClass]
    public class CommandProviderTest
    {
        [TestMethod]
        public void TestProcess()
        {
            var queryProvider = new CommandProvider();

            var nullResult = queryProvider.Process(null, null);
            Assert.AreEqual(nullResult.Code, CommandResultCode.Invalid);
            Assert.AreEqual(nullResult.ErrorMessage, "Invalid Command!");


        }
    }
}
