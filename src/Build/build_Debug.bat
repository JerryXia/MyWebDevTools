set RootDir=%~dp0..
%WINDIR%\Microsoft.NET\Framework\v3.5\MSBuild.exe "%RootDir%\OpsToolkit.Server\OpsToolkit.Server.csproj" /p:Configuration=Debug /t:ReBuild;Merge
pause
