# ============================================
# ClickMont - Script de Deploy e Configuracao
# Sprint 0 - Preparacao para Lancamento
# Data: 2026-04-01
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "menu"
)

$ErrorActionPreference = "Continue"

# Cores para output
function Write-Step { param([string]$msg) Write-Host "`n>>> $msg" -ForegroundColor Cyan }
function Write-Success { param([string]$msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param([string]$msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param([string]$msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

# ============================================
# VERIFICACOES INICIAIS
# ============================================
function Check-Prerequisites {
    Write-Step "Verificando pre-requisitos..."
    
    $hasNode = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
    $hasNpm = $null -ne (Get-Command npm -ErrorAction SilentlyContinue)
    $hasGit = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
    
    if (-not $hasNode) { Write-Warning "Node.js nao encontrado. Instale em https://nodejs.org" }
    if (-not $hasNpm) { Write-Warning "npm nao encontrado." }
    if (-not $hasGit) { Write-Warning "git nao encontrado. Instale em https://git-scm.com" }
    
    if ($hasNode -and $hasNpm) {
        Write-Success "Node.js e npm estao instalados"
        $nodeVersion = node --version
        Write-Host "    Versao: $nodeVersion" -ForegroundColor Gray
    }
    
    return ($hasNode -and $hasNpm -and $hasGit)
}

# ============================================
# DEPLOY EDGE FUNCTIONS
# ============================================
function Deploy-EdgeFunctions {
    Write-Step "Deploy de Edge Functions"
    
    $token = $env:SUPABASE_ACCESS_TOKEN
    if ([string]::IsNullOrEmpty($token)) {
        Write-Error "SUPABASE_ACCESS_TOKEN nao definido"
        Write-Host "Execute: `$env:SUPABASE_ACCESS_TOKEN = 'seu_token'"
        return $false
    }
    
    Write-Success "Token configurado"
    
    $functions = @(
        "create-checkout",
        "send-push",
        "notify-order-status",
        "notify-new-bid",
        "notify-payment-received",
        "notify-new-montador",
        "get-vapid-key"
    )
    
    foreach ($func in $functions) {
        Write-Host "`nDeploying $func..." -NoNewline
        npm run supabase:deploy -- $func 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$func deployed"
        } else {
            Write-Warning "$func pode ter falhado"
        }
    }
    
    return $true
}

# ============================================
# VERIFICAR STATUS DO SITE
# ============================================
function Check-SiteStatus {
    Write-Step "Verificando status do site"
    
    $url = "https://clickmont.com.br"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -UseBasicParsing
        Write-Success "Site online: $url"
        Write-Host "    Status: $($response.StatusCode)" -ForegroundColor Gray
    } catch {
        Write-Warning "Site pode estar offline: $url"
    }
    
    $supabaseUrl = "https://zwfiadmmfgillrqhlbjw.supabase.co"
    try {
        $response = Invoke-WebRequest -Uri $supabaseUrl -Method Head -TimeoutSec 10 -UseBasicParsing
        Write-Success "Supabase online: $supabaseUrl"
        Write-Host "    Status: $($response.StatusCode)" -ForegroundColor Gray
    } catch {
        Write-Warning "Supabase pode estar offline"
    }
}

# ============================================
# TESTAR EDGE FUNCTIONS
# ============================================
function Test-EdgeFunctions {
    Write-Step "Testando Edge Functions"
    
    $anonKey = $env:SUPABASE_ANON_KEY
    if ([string]::IsNullOrEmpty($anonKey)) {
        Write-Error "SUPABASE_ANON_KEY nao definido"
        return
    }
    
    $functions = @(
        @{ Name = "get-vapid-key"; Url = "https://zwfiadmmfgillrqhlbjw.supabase.co/functions/v1/get-vapid-key" }
    )
    
    foreach ($func in $functions) {
        Write-Host "`nTestando $($func.Name)..." -NoNewline
        try {
            $response = Invoke-RestMethod -Uri $func.Url -Method Get -Headers @{ Authorization = "Bearer $anonKey" } -TimeoutSec 10
            Write-Success "$($func.Name) - OK"
            Write-Host "    Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        } catch {
            Write-Warning "$($func.Name) - Falhou: $($_.Exception.Message)"
        }
    }
}

# ============================================
# VERIFICAR BANCO DE DADOS
# ============================================
function Check-Database {
    Write-Step "Verificando Banco de Dados (acesse via Supabase Dashboard)"
    Write-Host "URL: https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/sql"
    Write-Host ""
    Write-Host "Execute os SQL migrations em:"
    Write-Host "  - supabase/migrations/20260401000001_setup_storage.sql"
    Write-Host "  - supabase/migrations/20260401000003_test_users.sql"
}

# ============================================
# GERAR NOVO GITHUB PAT
# ============================================
function Show-GitHub-Instructions {
    Write-Step "Instrucoes para GitHub PAT"
    Write-Host ""
    Write-Host "1. Acesse: https://github.com/settings/tokens/new"
    Write-Host "2. Configure:"
    Write-Host "   - Token name: clickmont-deploy"
    Write-Host "   - Expiration: 90 days"
    Write-Host "   - Scopes: repo, workflow, admin:repo_hook"
    Write-Host ""
    Write-Host "3. Copie o token gerado"
    Write-Host "4. Atualize o Secret GITHUB_TOKEN no repositorio:"
    Write-Host "   https://github.com/andreelogio-glitch/clickmontcombr/settings/secrets/actions"
}

# ============================================
# MENU PRINCIPAL
# ============================================
function Show-Menu {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "  ClickMont - Sprint 0 Deployment" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1. Verificar Pre-requisitos"
    Write-Host "2. Verificar Status do Site"
    Write-Host "3. Deploy Edge Functions"
    Write-Host "4. Testar Edge Functions"
    Write-Host "5. Verificar Banco de Dados"
    Write-Host "6. Instrucoes GitHub PAT"
    Write-Host "7. Checklist Completo Sprint 0"
    Write-Host "0. Sair"
    Write-Host ""
}

# ============================================
# CHECKLIST COMPLETO
# ============================================
function Show-FullChecklist {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  Sprint 0 - Checklist Completo" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "[ ] 1. STORAGE BUCKETS (Supabase Dashboard)" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/storage"
    Write-Host "     - user-documents (privado)"
    Write-Host "     - product-photos (publico)"
    Write-Host "     - avatars (publico)"
    Write-Host "     Execute: supabase/migrations/20260401000001_setup_storage.sql"
    Write-Host ""
    
    Write-Host "[ ] 2. EDGE FUNCTION SECRETS (Supabase Dashboard)" -ForegroundColor White
    Write-Host "     https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/functions/secrets"
    Write-Host "     - SUPABASE_URL"
    Write-Host "     - SUPABASE_ANON_KEY"
    Write-Host "     - SUPABASE_SERVICE_ROLE_KEY"
    Write-Host "     - MERCADOPAGO_ACCESS_TOKEN"
    Write-Host "     - VAPID_PUBLIC_KEY (gerado)"
    Write-Host "     - VAPID_PRIVATE_KEY (gerado)"
    Write-Host ""
    
    Write-Host "[ ] 3. WEBHOOK MERCADO PAGO" -ForegroundColor White
    Write-Host "     https://www.mercadopago.com.br/developers/panel"
    Write-Host "     URL: https://zwfiadmmfgillrqhlbjw.supabase.co/functions/v1/mp-webhook"
    Write-Host "     Eventos: payment.created, payment.updated, payment.pending, etc."
    Write-Host ""
    
    Write-Host "[ ] 4. DEPLOY EDGE FUNCTIONS" -ForegroundColor White
    Write-Host "     `$env:SUPABASE_ACCESS_TOKEN = 'seu_pat'"
    Write-Host "     npm run supabase:deploy"
    Write-Host ""
    
    Write-Host "[ ] 5. GITHub PAT (novo)" -ForegroundColor White
    Write-Host "     https://github.com/settings/tokens/new"
    Write-Host "     Scopes: repo, workflow, admin:repo_hook"
    Write-Host ""
    
    Write-Host "[ ] 6. PUSH CODIGO" -ForegroundColor White
    Write-Host "     git push origin feat/auditoria-seguranca-clickmont"
    Write-Host ""
    
    Write-Host "[ ] 7. VERIFICAR SITE" -ForegroundColor White
    Write-Host "     https://clickmont.com.br"
    Write-Host ""
    
    Write-Host "[ ] 8. CRIAR USUARIOS DE TESTE" -ForegroundColor White
    Write-Host "     Crie 3 contas em clickmont.com.br"
    Write-Host "     Execute: supabase/migrations/20260401000003_test_users.sql"
    Write-Host ""
    
    Write-Host "Pressione qualquer tecla para voltar ao menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# ============================================
# EXECUCAO PRINCIPAL
# ============================================
do {
    Show-Menu
    $choice = Read-Host "Escolha uma opcao"
    
    switch ($choice) {
        "1" { Check-Prerequisites }
        "2" { Check-SiteStatus }
        "3" { Deploy-EdgeFunctions }
        "4" { Test-EdgeFunctions }
        "5" { Check-Database }
        "6" { Show-GitHub-Instructions }
        "7" { Show-FullChecklist }
        "0" { Write-Host "ATE MAIS!" -ForegroundColor Green; exit }
    }
    
    if ($choice -ne "7") {
        Write-Host ""
        Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
} while ($choice -ne "0")
