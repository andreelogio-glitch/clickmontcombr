import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PedirMontagemPage from "./pages/PedirMontagemPage";
import ChatPage from "./pages/ChatPage";
import AssistenciaPage from "./pages/AssistenciaPage";
import AdminAssistenciaPage from "./pages/AdminAssistenciaPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CarteiraPage from "./pages/CarteiraPage";
import QuemSomos from "./pages/QuemSomos";
import SouMontador from "./pages/SouMontador";
import CadastroMontador from "./pages/CadastroMontador";
import TermosPrivacidade from "./pages/TermosPrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import SuporteMontador from "./pages/SuporteMontador";
import AdminApproval from "./pages/AdminApproval";
import Institucional from "./pages/Institucional";
import MontadorDashboardPage from "./pages/MontadorDashboardPage";
import ClienteDashboardPage from "./pages/ClienteDashboardPage";

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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pedir-montagem" element={<PedirMontagemPage />} />
            <Route path="/chat/:orderId" element={<ChatPage />} />
            <Route path="/assistencia" element={<AssistenciaPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/assistencia" element={<AdminAssistenciaPage />} />
            <Route path="/carteira" element={<CarteiraPage />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/sou-montador" element={<SouMontador />} />
            <Route path="/cadastro-montador" element={<CadastroMontador />} />
            <Route path="/termos-e-privacidade" element={<TermosPrivacidade />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/suporte-montador" element={<SuporteMontador />} />
            <Route path="/admin-approval" element={<AdminApproval />} />
            <Route path="/institucional" element={<Institucional />} />
            <Route path="/montador" element={<MontadorDashboardPage />} />
            <Route path="/montador-dashboard" element={<MontadorDashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
