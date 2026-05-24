import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Windows: System.Drawing.Printing (electron/printWindow.ts 와 동일)
 */
export async function silentPrintImage(params: {
  imagePath: string;
  deviceName: string;
}): Promise<void> {
  const { imagePath, deviceName } = params;

  const csImage = imagePath.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const csDevice = deviceName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  const psScript = `
$ErrorActionPreference = 'Stop'

Add-Type -ReferencedAssemblies 'System.Drawing' -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Printing;

public static class HaesolPrinter {
    public static string Print(string imagePath, string printerName) {
        Bitmap bmp = null;
        PrintDocument pd = null;
        try {
            if (!System.IO.File.Exists(imagePath))
                return "ERR:FILE_NOT_FOUND:" + imagePath;

            bmp = new Bitmap(imagePath);
            pd  = new PrintDocument();

            pd.PrinterSettings.PrinterName = printerName;
            if (!pd.PrinterSettings.IsValid)
                return "ERR:PRINTER_INVALID:" + printerName;

            pd.PrintController            = new StandardPrintController();
            pd.DefaultPageSettings.Margins = new Margins(0, 0, 0, 0);
            pd.OriginAtMargins            = false;
            pd.DefaultPageSettings.Landscape = (bmp.Width > bmp.Height);

            foreach (PaperSize ps in pd.PrinterSettings.PaperSizes) {
                string n = ps.PaperName.ToLower();
                if (n.Contains("post") || n.Contains("photo") || n.Contains("l size")) {
                    pd.DefaultPageSettings.PaperSize = ps;
                    break;
                }
            }

            bool   printed   = false;
            string pageError = null;
            var    img       = bmp;

            pd.PrintPage += delegate(object sender, PrintPageEventArgs e) {
                try {
                    float pw = e.PageBounds.Width;
                    float ph = e.PageBounds.Height;
                    if (pw <= 0 || ph <= 0) { pw = img.Width; ph = img.Height; }

                    float iw = img.Width, ih = img.Height;

                    float scale = Math.Min(pw / iw, ph / ih);
                    float dw = iw * scale, dh = ih * scale;
                    float dx = (pw - dw) / 2f;
                    float dy = (ph - dh) / 2f;

                    e.Graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    e.Graphics.PixelOffsetMode   = PixelOffsetMode.HighQuality;
                    e.Graphics.DrawImage(img, dx, dy, dw, dh);
                    printed = true;
                } catch (Exception ex) {
                    pageError = ex.Message;
                }
                e.HasMorePages = false;
            };

            pd.Print();
            System.Threading.Thread.Sleep(3000);

            if (pageError != null) return "ERR:PAGE:" + pageError;
            if (!printed)          return "ERR:PAGE_NOT_CALLED";

            return "OK:" + bmp.Width + "x" + bmp.Height
                         + "  paper=" + pd.DefaultPageSettings.PaperSize.PaperName
                         + "  printer=" + pd.PrinterSettings.PrinterName;
        } catch (Exception ex) {
            return "ERR:EXCEPTION:" + ex.Message;
        } finally {
            if (bmp != null) bmp.Dispose();
            if (pd  != null) pd.Dispose();
        }
    }
}
"@

$result = [HaesolPrinter]::Print("${csImage}", "${csDevice}")
Write-Output "[print] $result"
if ($result -like "ERR:*") { throw $result }
`.trim();

  const tmpScript = path.join(os.tmpdir(), `haesol_print_${Date.now()}.ps1`);
  try {
    await fs.writeFile(tmpScript, psScript, "utf-8");

    const { stdout, stderr } = await execFileAsync(
      "powershell",
      [
        "-NonInteractive",
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-WindowStyle",
        "Hidden",
        "-File",
        tmpScript
      ],
      { timeout: 90_000 }
    );

    if (stdout.trim()) {
      console.log(stdout.trim());
    }
    if (stderr.trim()) {
      throw new Error(`PRINT_STDERR: ${stderr.trim()}`);
    }
  } catch (err) {
    throw new Error(`PRINT_FAILED: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await fs.unlink(tmpScript).catch(() => undefined);
  }
}
