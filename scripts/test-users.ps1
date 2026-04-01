<# 
    ClickMont - Script de Teste de Usuarios
    Execute apos criar usuarios no sistema
    Data: 2026-04-01
#>

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " ClickMont - Setup de Usuarios de Teste" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Credenciais Supabase
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmlhZG1tZmdpbGxycWhsYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTE3OTcsImV4cCI6MjA4NzYyNzc5N30.xqCG6hExgRWq5uuA8TxIkDlAunQj7NOMr2zEIhVt394"
$SUPABASE_URL = "https://zwfiadmmfgillrqhlbjw.supabase.co"

$headers = @{
    "apikey" = $ANON_KEY
    "Authorization" = "Bearer $ANON_KEY"
}

function Get-Users {
    Write-Host "[1] Buscando usuarios..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/users" -Method GET -Headers $headers
        Write-Host "Usuarios encontrados: $($response.users.Count)" -ForegroundColor Green
        $response.users | ForEach-Object {
            Write-Host "  - $($_.email) (ID: $($_.id))" -ForegroundColor White
        }
        return $response.users
    } catch {
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

function Get-Profiles {
    Write-Host "`n[2] Buscando perfis..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/profiles?select=*" -Method GET -Headers $headers
        Write-Host "Perfis encontrados: $($response.Count)" -ForegroundColor Green
        $response | ForEach-Object {
            Write-Host "  - $($_.full_name) | Role: $($_.role)" -ForegroundColor White
        }
        return $response
    } catch {
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        return @()
    }
}

function Show-Menu {
    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host " Menu de Testes" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "1. Listar usuarios (Auth)" -ForegroundColor White
    Write-Host "2. Listar perfis (Profiles)" -ForegroundColor White
    Write-Host "3. Ver todos" -ForegroundColor White
    Write-Host "0. Sair" -ForegroundColor White
    Write-Host ""
}

# Loop principal
do {
    Show-Menu
    $choice = Read-Host "Escolha uma opcao"
    
    switch ($choice) {
        "1" { Get-Users }
        "2" { Get-Profiles }
        "3" { 
            $users = Get-Users
            $profiles = Get-Profiles
            Write-Host "`n============================================" -ForegroundColor Cyan
            Write-Host " RESUMO" -ForegroundColor Cyan
            Write-Host "============================================" -ForegroundColor Cyan
            Write-Host "Total de usuarios: $($users.Count)" -ForegroundColor Green
            Write-Host "Total de perfis: $($profiles.Count)" -ForegroundColor Green
        }
        "0" { 
            Write-Host "Saindo..." -ForegroundColor Yellow
            break 
        }
        default { Write-Host "Opcao invalida!" -ForegroundColor Red }
    }
} while ($choice -ne "0")

Write-Host "`nProximo passo:" -ForegroundColor Cyan
Write-Host "1. Cadastre-se em https://clickmont.com.br" -ForegroundColor White
Write-Host "2. Execute o SQL em: supabase/migrations/20260401000003_test_users.sql" -ForegroundColor White
Write-Host "3. Configure seu usuario como admin" -ForegroundColor White
Write-Host "4. Teste os fluxos de Cliente, Montador e Admin" -ForegroundColor White
