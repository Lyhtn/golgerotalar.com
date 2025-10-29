Add-Type -AssemblyName System.Drawing

$quality = 82

$assetsDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $assetsDir

Write-Host "Optimizing images in: $assetsDir"

# Process all jpg/jpeg/png files in assets root (skip backups and new_uploads)
$files = Get-ChildItem -Path $assetsDir -File -Include *.jpg,*.jpeg,*.png -Recurse:$false |
    Where-Object { $_.DirectoryName -eq $assetsDir }

foreach ($file in $files) {
    # skip images in backups or new_uploads (they're directories and excluded by above)
    Write-Host "Processing $($file.Name)"
    try {
        $orig = [System.Drawing.Image]::FromFile($file.FullName)
    } catch {
        Write-Warning "Cannot open $($file.Name): $_"
        continue
    }
    $w0 = $orig.Width
    $h0 = $orig.Height

    # If image is wider than 1200, resize down to 1200 preserving aspect
    $max = 1200
    if ([math]::Max($w0,$h0) -gt $max) {
        $ratio = $max / [math]::Max($w0,$h0)
        $tw = [int]([math]::Max(1, [math]::Round($w0 * $ratio)))
        $th = [int]([math]::Max(1, [math]::Round($h0 * $ratio)))
    } else {
        $tw = $w0
        $th = $h0
    }

    $bmp = New-Object System.Drawing.Bitmap $tw, $th
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $rect = New-Object System.Drawing.Rectangle 0,0,$tw,$th
    $g.DrawImage($orig, $rect)

    $jpgOut = $file.FullName

    $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
    $jpegEncoder = $encoders | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
    $param = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
    $encParams.Param[0] = $param

    Write-Host " Saving optimized $jpgOut ($tw x $th)"
    $bmp.Save($jpgOut, $jpegEncoder, $encParams)
    $g.Dispose()
    $bmp.Dispose()
    $orig.Dispose()
}

Write-Host "Optimization complete."