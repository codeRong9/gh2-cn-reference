using System.Reflection;
using System.Runtime.Loader;
const string Gh2Dir = @"D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0";
const string RhinoSystem = @"D:\RHINO\System";
AssemblyLoadContext.Default.Resolving += (ctx, name) => {
    foreach (var dir in new[] { Gh2Dir, Path.Combine(Gh2Dir, "Components"), RhinoSystem }) {
        var p = Path.Combine(dir, name.Name + ".dll");
        if (File.Exists(p)) return ctx.LoadFromAssemblyPath(p);
    }
    return null;
};
var rhp = Assembly.LoadFrom(@"D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0\Components\G2MathsComponents.rhp");
using var s = rhp.GetManifestResourceStream("MathsComponents.Icons.Addition.ghicon");
var ms = new MemoryStream(); s!.CopyTo(ms); var b = ms.ToArray();
Console.WriteLine($"len={b.Length}");
Console.WriteLine(BitConverter.ToString(b, 0, Math.Min(256, b.Length)));
