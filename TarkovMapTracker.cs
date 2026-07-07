using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace TarkovMapTracker
{
    static class Program
    {
        private static string WatchDir;
        private static string latestCoords = "";
        private static readonly object coordLock = new object();
        private static NotifyIcon trayIcon;

        [STAThread]
        static void Main()
        {
            Application.ThreadException += (s, e) => DumpError(e.Exception);
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
                DumpError(e.ExceptionObject as Exception);

            try
            {
                WatchDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    "Escape from Tarkov", "Screenshots");

                Application.ApplicationExit += (s, e) => Cleanup();

                trayIcon = new NotifyIcon();
                trayIcon.Icon = LoadIcon();
                trayIcon.Text = "Tarkov Map Tracker";
                trayIcon.Visible = true;

                var menu = new ContextMenu();
                menu.MenuItems.Add("Выход", (s2, e2) => Application.Exit());
                trayIcon.ContextMenu = menu;
                trayIcon.ShowBalloonTip(3000, "Tarkov Map Tracker",
                    "Сервер запущен на http://127.0.0.1:12345", ToolTipIcon.Info);

                if (Directory.Exists(WatchDir))
                {
                    var watcher = new FileSystemWatcher(WatchDir);
                    watcher.Filter = "*.*";
                    watcher.IncludeSubdirectories = false;
                    watcher.Created += OnFileCreated;
                    watcher.EnableRaisingEvents = true;
                }
                else
                {
                    trayIcon.ShowBalloonTip(5000, "Папка не найдена",
                        WatchDir, ToolTipIcon.Warning);
                    DumpError(new DirectoryNotFoundException(
                        "Папка мониторинга не найдена: " + WatchDir));
                }

                var serverThread = new Thread(RunServer) { IsBackground = true };
                serverThread.Start();

                Application.Run();
            }
            catch (Exception ex)
            {
                DumpError(ex);
                MessageBox.Show("Критическая ошибка. См. дамп рядом с EXE.\n" + ex.Message,
                    "Tarkov Map Tracker", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static System.Drawing.Icon LoadIcon()
        {
            try
            {
                using (var stream = Assembly.GetExecutingAssembly()
                    .GetManifestResourceStream("TarkovMapTracker.pngegg.png"))
                {
                    if (stream != null)
                    {
                        using (var bmp = new System.Drawing.Bitmap(stream))
                        {
                            return System.Drawing.Icon.FromHandle(bmp.GetHicon());
                        }
                    }
                }
            }
            catch { }
            return System.Drawing.SystemIcons.Application;
        }

        private static void OnFileCreated(object sender, FileSystemEventArgs e)
        {
            try
            {
                var lower = e.FullPath.ToLowerInvariant();
                if (!lower.EndsWith(".png") && !lower.EndsWith(".jpg") &&
                    !lower.EndsWith(".jpeg"))
                    return;

                Thread.Sleep(200);

                var name = Path.GetFileNameWithoutExtension(e.Name);
                lock (coordLock)
                {
                    latestCoords = name;
                }

                try { File.Delete(e.FullPath); } catch { }
            }
            catch (Exception ex)
            {
                DumpError(ex);
            }
        }

        private static void RunServer()
        {
            var listener = new TcpListener(IPAddress.Loopback, 12345);
            listener.Start();
            while (true)
            {
                try
                {
                    var client = listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(_ => HandleClient(client));
                }
                catch (Exception ex)
                {
                    DumpError(ex);
                    Thread.Sleep(1000);
                }
            }
        }

        private static void HandleClient(TcpClient client)
        {
            try
            {
                using (client)
                using (var ns = client.GetStream())
                {
                    var buf = new byte[4096];
                    int read = ns.Read(buf, 0, buf.Length);
                    var request = Encoding.ASCII.GetString(buf, 0, read);

                    string coords;
                    lock (coordLock)
                    {
                        coords = latestCoords;
                        latestCoords = "";
                    }

                    var safe = coords.Replace("\\", "\\\\").Replace("\"", "\\\"");
                    var json = "{\"coords\":\"" + safe + "\"}";
                    var body = Encoding.UTF8.GetBytes(json);

                    var header = "HTTP/1.1 200 OK\r\n"
                        + "Content-Type: application/json\r\n"
                        + "Access-Control-Allow-Origin: *\r\n"
                        + "Access-Control-Allow-Methods: GET, OPTIONS\r\n"
                        + "Access-Control-Allow-Headers: Content-Type\r\n"
                        + "Content-Length: " + body.Length + "\r\n"
                        + "Connection: close\r\n\r\n";

                    var outBytes = new MemoryStream();
                    var hb = Encoding.UTF8.GetBytes(header);
                    outBytes.Write(hb, 0, hb.Length);
                    outBytes.Write(body, 0, body.Length);
                    var resp = outBytes.ToArray();
                    ns.Write(resp, 0, resp.Length);
                }
            }
            catch { }
        }

        private static void Cleanup()
        {
            try { if (trayIcon != null) trayIcon.Dispose(); } catch { }
        }

        private static void DumpError(Exception ex)
        {
            if (ex == null) return;
            try
            {
                var ts = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var path = Path.Combine(
                    AppDomain.CurrentDomain.BaseDirectory, "error_" + ts + ".txt");

                var sb = new StringBuilder();
                sb.AppendLine("Tarkov Map Tracker - Error Dump");
                sb.AppendLine("Time: " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
                sb.AppendLine("OS: " + Environment.OSVersion);
                sb.AppendLine("========================================");
                var e = ex;
                var i = 0;
                while (e != null)
                {
                    sb.AppendLine("Exception #" + i + ": " + e.GetType().FullName);
                    sb.AppendLine("Message: " + e.Message);
                    sb.AppendLine("StackTrace:");
                    sb.AppendLine(e.StackTrace);
                    sb.AppendLine("----------------------------------------");
                    e = e.InnerException;
                    i++;
                }
                File.WriteAllText(path, sb.ToString());
            }
            catch { }
        }
    }
}
