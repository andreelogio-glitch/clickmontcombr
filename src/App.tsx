import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pedir-montagem" element={<PedirMontagemPage />} />
          <Route path="/chat/:orderId" element={<ChatPage />} />
          <Route path="/assistencia" element={<AssistenciaPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/assistencia" element={<AdminAssistenciaPage />} />
          <Route path="/carteira" element={<CarteiraPage />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/sou-montador" element={<SouMontador />} />
          <Route path="/cadastro-montador" element={<CadastroMontador />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
