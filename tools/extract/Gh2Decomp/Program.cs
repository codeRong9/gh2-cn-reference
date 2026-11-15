using ICSharpCode.Decompiler;
using ICSharpCode.Decompiler.CSharp;
using ICSharpCode.Decompiler.TypeSystem;

// 用法：
//   dotnet run -- module <assemblyPath> <outputDir>        整模块反编译
//   dotnet run -- type   <assemblyPath> <typeFullName...>   仅反编译指定类型
if (args.Length < 2)
{
    Console.Error.WriteLine("usage: Gh2Decomp module <assembly> <outDir> | type <assembly> <fullTypeName>...");
    return 2;
}

var mode = args[0];
var assemblyPath = args[1];

var settings = new DecompilerSettings
{
    ThrowOnAssemblyResolveErrors = false,
    ShowXmlDocumentation = false,
};

var decompiler = new CSharpDecompiler(assemblyPath, settings);

if (mode == "module")
{
    var outputDir = args[2];
    Directory.CreateDirectory(outputDir);
    var text = decompiler.DecompileWholeModuleAsString();
    var name = Path.GetFileNameWithoutExtension(assemblyPath);
    var outFile = Path.Combine(outputDir, name + ".cs");
    File.WriteAllText(outFile, text);
    Console.WriteLine($"{name}\t{text.Length}\t{outFile}");
    return 0;
}

if (mode == "type")
{
    foreach (var typeName in args.Skip(2))
    {
        var source = decompiler.DecompileTypeAsString(new FullTypeName(typeName));
        Console.WriteLine($"===== {typeName} =====");
        Console.WriteLine(source);
    }
    return 0;
}

Console.Error.WriteLine($"unknown mode: {mode}");
return 2;
