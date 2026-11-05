param(
  [string]$Root = (Split-Path $PSScriptRoot -Parent),
  [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$rootPath = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root).Path)
$rootPrefix = $rootPath.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)

try {
  $listener.Start()
} catch [Net.Sockets.SocketException] {
  # Another copy of this server is already running on the requested port.
  exit 0
}

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'
  '.mjs' = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.gif' = 'image/gif'
  '.mp3' = 'audio/mpeg'
  '.ogg' = 'audio/ogg'
  '.wav' = 'audio/wav'
  '.glb' = 'model/gltf-binary'
  '.gltf' = 'model/gltf+json'
  '.otf' = 'font/otf'
  '.ttf' = 'font/ttf'
  '.woff' = 'font/woff'
  '.woff2' = 'font/woff2'
  '.pdf' = 'application/pdf'
}

function Write-Response {
  param(
    [Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [hashtable]$Headers,
    [byte[]]$Body = @(),
    [string]$Method = 'GET'
  )

  $lines = [Collections.Generic.List[string]]::new()
  $lines.Add("HTTP/1.1 $StatusCode $StatusText")
  foreach ($name in $Headers.Keys) { $lines.Add("${name}: $($Headers[$name])") }
  $lines.Add('Connection: close')
  $lines.Add('')
  $lines.Add('')
  $headerBytes = [Text.Encoding]::ASCII.GetBytes(($lines -join "`r`n"))
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Method -ne 'HEAD' -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $client.ReceiveTimeout = 3000
    $client.SendTimeout = 10000
    $stream = $null
    $reader = $null
    try {
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

      $requestParts = $requestLine.Split(' ')
      if ($requestParts.Length -lt 2) { continue }
      $method = $requestParts[0].ToUpperInvariant()
      $requestHeaders = @{}
      while ($true) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) { break }
        $separator = $line.IndexOf(':')
        if ($separator -gt 0) {
          $requestHeaders[$line.Substring(0, $separator).Trim().ToLowerInvariant()] = $line.Substring($separator + 1).Trim()
        }
      }

      if ($method -notin @('GET', 'HEAD')) {
        $body = [Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
        Write-Response $stream 405 'Method Not Allowed' @{ 'Content-Type' = 'text/plain; charset=utf-8'; 'Content-Length' = $body.Length } $body $method
        continue
      }

      $urlPath = $requestParts[1].Split('?')[0]
      $relativePath = [Uri]::UnescapeDataString($urlPath).TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
      if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
      $filePath = [IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))

      if (-not $filePath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and -not $filePath.Equals($rootPath, [StringComparison]::OrdinalIgnoreCase)) {
        $body = [Text.Encoding]::UTF8.GetBytes('Forbidden')
        Write-Response $stream 403 'Forbidden' @{ 'Content-Type' = 'text/plain; charset=utf-8'; 'Content-Length' = $body.Length } $body $method
        continue
      }

      if (Test-Path -LiteralPath $filePath -PathType Container) { $filePath = Join-Path $filePath 'index.html' }
      if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        $body = [Text.Encoding]::UTF8.GetBytes('Not Found')
        Write-Response $stream 404 'Not Found' @{ 'Content-Type' = 'text/plain; charset=utf-8'; 'Content-Length' = $body.Length } $body $method
        continue
      }

      $file = [IO.FileInfo]::new($filePath)
      $extension = $file.Extension.ToLowerInvariant()
      $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
      $start = [int64]0
      $end = $file.Length - 1
      $statusCode = 200
      $statusText = 'OK'

      if ($requestHeaders.ContainsKey('range') -and $requestHeaders['range'] -match '^bytes=(\d*)-(\d*)$') {
        if ($Matches[1]) { $start = [int64]$Matches[1] }
        if ($Matches[2]) { $end = [Math]::Min([int64]$Matches[2], $file.Length - 1) }
        if (-not $Matches[1] -and $Matches[2]) {
          $start = [Math]::Max([int64]0, $file.Length - [int64]$Matches[2])
          $end = $file.Length - 1
        }
        if ($start -le $end -and $start -lt $file.Length) {
          $statusCode = 206
          $statusText = 'Partial Content'
        } else {
          Write-Response $stream 416 'Range Not Satisfiable' @{ 'Content-Range' = "bytes */$($file.Length)"; 'Content-Length' = 0 } @() $method
          continue
        }
      }

      $length = $end - $start + 1
      $headers = @{
        'Content-Type' = $contentType
        'Content-Length' = $length
        'Accept-Ranges' = 'bytes'
        'Cache-Control' = if ($extension -in @('.html', '.css', '.js', '.mjs')) { 'no-cache' } else { 'public, max-age=3600' }
      }
      if ($statusCode -eq 206) { $headers['Content-Range'] = "bytes $start-$end/$($file.Length)" }

      $lines = [Collections.Generic.List[string]]::new()
      $lines.Add("HTTP/1.1 $statusCode $statusText")
      foreach ($name in $headers.Keys) { $lines.Add("${name}: $($headers[$name])") }
      $lines.Add('Connection: close')
      $lines.Add('')
      $lines.Add('')
      $headerBytes = [Text.Encoding]::ASCII.GetBytes(($lines -join "`r`n"))
      $stream.Write($headerBytes, 0, $headerBytes.Length)

      if ($method -ne 'HEAD') {
        $fileStream = [IO.File]::OpenRead($filePath)
        try {
          $fileStream.Seek($start, [IO.SeekOrigin]::Begin) | Out-Null
          $buffer = New-Object byte[] 65536
          $remaining = $length
          while ($remaining -gt 0) {
            $read = $fileStream.Read($buffer, 0, [Math]::Min($buffer.Length, $remaining))
            if ($read -le 0) { break }
            $stream.Write($buffer, 0, $read)
            $remaining -= $read
          }
        } finally {
          $fileStream.Dispose()
        }
      }
    } catch {
      # A single aborted browser request should not stop the local server.
    } finally {
      if ($null -ne $reader) { $reader.Dispose() }
      if ($null -ne $stream) { $stream.Dispose() }
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
