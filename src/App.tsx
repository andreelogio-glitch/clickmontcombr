import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import QuemSomos from "./pages/QuemSomos";
import SouMontador from "./pages/SouMontador";
import CadastroMontador from "./pages/CadastroMontador";
import TermosPrivacidade from "./pages/TermosPrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import Institucional from "./pages/Institucional";
import ChatPage from "./pages/ChatPage";
import CarteiraPage from "./pages/CarteiraPage";
import AssistenciaPage from "./pages/AssistenciaPage";
import PedirMontagemPage from "./pages/PedirMontagemPage";
import ClienteDashboardPage from "./pages/ClienteDashboardPage";
import MontadorDashboardPage from "./pages/MontadorDashboardPage";
import SuporteMontador from "./pages/SuporteMontador";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminAssistenciaPage from "./pages/AdminAssistenciaPage";
import AdminApproval from "./pages/AdminApproval";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <HashRouter>
            <Routes>

              {/* ROTAS PÚBLICAS */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/quem-somos" element={<QuemSomos />} />
              <Route path="/sou-montador" element={<SouMontador />} />
              <Route path="/cadastro-montador" element={<CadastroMontador />} />
              <Route path="/termos-e-privacidade" element={<TermosPrivacidade />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/institucional" element={<Institucional />} />

              {/* ROTAS PROTEGIDAS - qualquer usuário logado */}
              <Route path="/chat/:orderId" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/carteira" element={
                <ProtectedRoute>
                  <CarteiraPage />
                </ProtectedRoute>
              } />
              <Route path="/assistencia" element={
                <ProtectedRoute>
                  <AssistenciaPage />
                </ProtectedRoute>
              } />

              {/* ROTAS EXCLUSIVAS DO CLIENTE */}
              <Route path="/pedir-montagem" element={
                <ProtectedRoute allowedRoles={["cliente"]}>
                  <PedirMontagemPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/cliente" element={
                <ProtectedRoute allowedRoles={["cliente"]}>
                  <ClienteDashboardPage />
                </ProtectedRoute>
              } />

              {/* ROTAS EXCLUSIVAS DO MONTADOR */}
              <Route path="/dashboard/montador" element={
                <ProtectedRoute allowedRoles={["montador"]}>
                  <MontadorDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/suporte-montador" element={
                <ProtectedRoute allowedRoles={["montador"]}>
                  <SuporteMontador />
                </ProtectedRoute>
              } />

              {/* ROTAS EXCLUSIVAS DO ADMIN */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/assistencia" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAssistenciaPage />
                </ProtectedRoute>
              } />
              <Route path="/admin-approval" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminApproval />
                </ProtectedRoute>
              } />

              {/* REDIRECIONAMENTOS DE ROTAS ANTIGAS */}
              <Route path="/montador" element={<Navigate to="/dashboard/montador" replace />} />
              <Route path="/montador-dashboard" element={<Navigate to="/dashboard/montador" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </HashRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
