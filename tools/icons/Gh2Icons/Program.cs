using System.Reflection;
using System.Runtime.Loader;

// 用法：
//   dotnet run -- probe <rhp>
//   dotnet run -- debug <rhp>
//   dotnet run -- export <rhp> <outDir>
// 通过反射把 GH2 的 VectorIcon 资源转成 SVG。
const string RhinoSystem = @"D:\RHINO\System";
const string Gh2Dir = @"D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0";

AssemblyLoadContext.Default.Resolving += (ctx, name) =>
{
    foreach (var dir in new[] { Gh2Dir, Path.Combine(Gh2Dir, "Components"), RhinoSystem })
    {
        var candidate = Path.Combine(dir, name.Name + ".dll");
        if (File.Exists(candidate))
        {
            return ctx.LoadFromAssemblyPath(candidate);
        }
    }
    return null;
};

if (args.Length < 2)
{
    Console.Error.WriteLine("usage: Gh2Icons probe|debug|export <rhp> [outDir]");
    return 2;
}

var mode = args[0];
var rhpPath = args[1];

var gh2 = Assembly.LoadFrom(Path.Combine(Gh2Dir, "Grasshopper2.dll"));
var grasshopperIo = Assembly.LoadFrom(Path.Combine(Gh2Dir, "GrasshopperIO.dll"));
var ioType = grasshopperIo.GetType("GrasshopperIO.IO")!;
var register = ioType.GetMethods(BindingFlags.Public | BindingFlags.Static)
    .First(m => m.Name == "RegisterRestorableType" && m.GetParameters().Length == 1);
var storableInterface = grasshopperIo.GetType("GrasshopperIO.IStorable")!;

// 把 GH2 里所有 IStorable 类型登记进 IO 类型表，否则 ReadStorableFromStream 找不到 VectorIcon。
var registered = 0;
Type?[] allTypes;
try
{
    allTypes = gh2.GetTypes();
}
catch (ReflectionTypeLoadException ex)
{
    allTypes = ex.Types;
}
foreach (var t in allTypes)
{
    if (t is null || t.IsAbstract || t.IsInterface || t.IsGenericTypeDefinition)
    {
        continue;
    }
    if (!storableInterface.IsAssignableFrom(t))
    {
        continue;
    }
    try
    {
        register.Invoke(null, new object[] { t });
        registered++;
    }
    catch
    {
        // 个别类型没有无参构造，跳过即可
    }
}

var abstractIcon = gh2.GetType("Grasshopper2.UI.Icon.AbstractIcon")!;
var fromStream = abstractIcon.GetMethod("FromStream", new[] { typeof(Stream) })!;

var rhp = Assembly.LoadFrom(rhpPath);
var resources = rhp.GetManifestResourceNames();

if (mode == "probe")
{
    Console.Error.WriteLine($"registered={registered}");
    Console.WriteLine($"resources={resources.Length}");
    foreach (var r in resources.Take(40))
    {
        Console.WriteLine("  " + r);
    }
    return 0;
}

if (mode == "debug")
{
    Console.Error.WriteLine($"registered={registered}");
    foreach (var res in resources.Where(r => r.EndsWith(".ghicon", StringComparison.OrdinalIgnoreCase)).Take(3))
    {
        using var stream = rhp.GetManifestResourceStream(res)!;
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        Console.WriteLine($"{res} bytes={ms.Length}");
        ms.Position = 0;
        var icon = fromStream.Invoke(null, new object[] { ms });
        Console.WriteLine($"  iconType={icon?.GetType().FullName ?? "null"}");
        if (icon is not null)
        {
            var svg = icon.GetType().GetMethod("ToSvgXml")?.Invoke(icon, null) as string;
            Console.WriteLine($"  svg={(svg is null ? "null" : svg[..Math.Min(120, svg.Length)])}");
        }
    }
    return 0;
}

var outDir = args[2];
Directory.CreateDirectory(outDir);
var ok = 0;
var fail = 0;
var index = new Dictionary<string, string>(StringComparer.Ordinal);
var errors = new Dictionary<string, int>();
foreach (var res in resources.Where(r => r.EndsWith(".ghicon", StringComparison.OrdinalIgnoreCase)))
{
    var shortName = res[..^".ghicon".Length];
    // 资源形如 MathsComponents.Icons.Boolean_Icons.OP_AND，取 Icons. 之后的分组路径作为 key
    var iconsIdx = shortName.IndexOf(".Icons.", StringComparison.Ordinal);
    var key = iconsIdx >= 0 ? shortName[(iconsIdx + ".Icons.".Length)..] : shortName;
    if (index.ContainsKey(key))
    {
        continue;
    }
    using var stream = rhp.GetManifestResourceStream(res)!;
    using var ms = new MemoryStream();
    stream.CopyTo(ms);
    ms.Position = 0;
    object? icon = null;
    try
    {
        icon = fromStream.Invoke(null, new object[] { ms });
    }
    catch (Exception ex)
    {
        var key2 = ex.InnerException?.Message ?? ex.Message;
        errors[key2] = errors.GetValueOrDefault(key2) + 1;
        fail++;
        continue;
    }
    if (icon is null)
    {
        fail++;
        continue;
    }
    var svg = icon.GetType().GetMethod("ToSvgXml")?.Invoke(icon, null) as string;
    if (string.IsNullOrWhiteSpace(svg))
    {
        fail++;
        continue;
    }
    var safe = key.Replace('.', '_').Replace('/', '_').Replace('\\', '_');
    File.WriteAllText(Path.Combine(outDir, safe + ".svg"), svg);
    index[key] = safe + ".svg";
    ok++;
}
File.WriteAllText(
    Path.Combine(outDir, "_index.json"),
    System.Text.Json.JsonSerializer.Serialize(index, new System.Text.Json.JsonSerializerOptions { WriteIndented = true })
);
Console.WriteLine($"{Path.GetFileNameWithoutExtension(rhpPath)}\tok={ok}\tfail={fail}");
foreach (var kv in errors.Take(3))
{
    Console.Error.WriteLine($"  err x{kv.Value}: {kv.Key}");
}
return 0;
