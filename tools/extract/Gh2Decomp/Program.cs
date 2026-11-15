using ICSharpCode.Decompiler;
using ICSharpCode.Decompiler.CSharp;
using ICSharpCode.Decompiler.TypeSystem;

// 用法：
//   dotnet run -- module      <assemblyPath> <outputDir>        整模块反编译
//   dotnet run -- type        <assemblyPath> <typeFullName...>   仅反编译指定类型
//   dotnet run -- list-comp   <assemblyPath> [baseTypeName]      列出继承指定基类的类型（默认 Grasshopper2.Components.Component）
if (args.Length < 2)
{
    Console.Error.WriteLine("usage: Gh2Decomp module <assembly> <outDir> | type <assembly> <fullTypeName>... | list-comp <assembly> [baseType]");
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
        string source;
        try
        {
            source = decompiler.DecompileTypeAsString(new FullTypeName(typeName));
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"skip {typeName}: {ex.Message}");
            continue;
        }
        Console.WriteLine($"===== {typeName} =====");
        Console.WriteLine(source);
    }
    return 0;
}

if (mode == "list-comp")
{
    var baseName = args.Length > 2 ? args[2] : "Grasshopper2.Components.Component";
    var module = decompiler.TypeSystem.MainModule;
    var count = 0;

    foreach (var type in module.TypeDefinitions)
    {
        if (type.IsAbstract || type.Kind != TypeKind.Class)
        {
            continue;
        }

        var derives = false;
        IType? cursor = type.DirectBaseTypes.FirstOrDefault();
        var guard = 0;
        while (cursor != null && guard++ < 32)
        {
            if (cursor.FullName == baseName)
            {
                derives = true;
                break;
            }
            cursor = cursor.DirectBaseTypes.FirstOrDefault();
        }
        if (!derives)
        {
            continue;
        }

        var guid = "";
        foreach (var attr in type.GetAttributes())
        {
            if (attr.AttributeType.Name != "IoIdAttribute")
            {
                continue;
            }
            if (attr.FixedArguments.Length > 0 && attr.FixedArguments[0].Value is string raw)
            {
                guid = raw;
            }
        }

        var author = "";
        foreach (var attr in type.GetAttributes())
        {
            if (attr.AttributeType.Name != "AuthorAttribute" || attr.FixedArguments.Length == 0)
            {
                continue;
            }
            if (attr.FixedArguments[0].Value is string name)
            {
                author = name;
            }
        }

        count++;
        Console.WriteLine($"{type.FullName}\t{guid}\t{author}");
    }

    Console.Error.WriteLine($"total={count}");
    return 0;
}

if (mode == "list-types")
{
    var filter = args.Length > 2 ? args[2] : "";
    var module = decompiler.TypeSystem.MainModule;
    var hits = 0;

    foreach (var type in module.TypeDefinitions)
    {
        if (filter.Length > 0 && !type.FullName.Contains(filter, StringComparison.OrdinalIgnoreCase))
        {
            continue;
        }
        var baseType = type.DirectBaseTypes.FirstOrDefault()?.FullName ?? "";
        hits++;
        Console.WriteLine($"{type.FullName}\t{baseType}\t{(type.DeclaringType != null ? 1 : 0)}\t{(type.IsAbstract ? 1 : 0)}");
    }

    Console.Error.WriteLine($"total={hits}");
    return 0;
}

Console.Error.WriteLine($"unknown mode: {mode}");
return 2;
