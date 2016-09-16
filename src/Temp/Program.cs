using System;
using System.Collections.Generic;
using System.Text;

namespace Temp
{
    class Program
    {
        static void Main(string[] args)
        {
            int i = 0;
            do
            {
                if(i == 3)
                {
                    throw new Exception("sdfs");
                }
                Console.WriteLine(i);
                i += 1;
            }
            while(i < 5);


            Console.ReadLine();
        }
    }
}
