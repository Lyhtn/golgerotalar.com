Add-Type -AssemblyName System.Drawing

$images = @(
    @{ Path = 'route1.jpg'; Name = 'route1'; Sizes = @(400,800,1200) },
    @{ Path = 'route2.jpg'; Name = 'route2'; Sizes = @(400,800,1200) },
    @{ Path = 'route3.jpg'; Name = 'route3'; Sizes = @(400,800,1200) },
    @{ Path = 'hero-poster.jpg'; Name = 'hero-poster'; Sizes = @(800,1600) }
)

$quality = 82

$assetsDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $assetsDir

Write-Host "Optimizing images in: $assetsDir"

foreach ($img in $images) {
    $srcPath = Join-Path $assetsDir $img.Path
    if (-not (Test-Path $srcPath)) {
        Write-Warning "$srcPath not found, skipping"
        continue
    }
    Write-Host "Processing $($img.Path)"
    $orig = [System.Drawing.Image]::FromFile($srcPath)
    $w0 = $orig.Width
    $h0 = $orig.Height

    foreach ($s in $img.Sizes) {
        $ratio = $s / [math]::Max($w0,$h0)
        $tw = [int]([math]::Max(1, [math]::Round($w0 * $ratio)))
        $th = [int]([math]::Max(1, [math]::Round($h0 * $ratio)))

        $bmp = New-Object System.Drawing.Bitmap $tw, $th
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $rect = New-Object System.Drawing.Rectangle 0,0,$tw,$th
        $g.DrawImage($orig, $rect)

        $jpgOut = Join-Path $assetsDir ("{0}-{1}.jpg" -f $img.Name, $s)

        $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
        $jpegEncoder = $encoders | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
        $param = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [int64]$quality)
        $encParams.Param[0] = $param

        Write-Host " Saving $jpgOut ($tw x $th)"
        $bmp.Save($jpgOut, $jpegEncoder, $encParams)
        $g.Dispose()
        $bmp.Dispose()
    }
    $orig.Dispose()
}

Write-Host "Optimization complete."