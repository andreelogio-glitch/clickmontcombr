import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const MontadorPendingApproval = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-lg w-full border-primary/20">
        <CardContent className="py-12 text-center space-y-4">
          <ShieldCheck className="h-16 w-16 mx-auto text-primary opacity-80" />
          <h2 className="text-2xl font-bold">Cadastro em análise humanizada</h2>
          <p className="text-muted-foreground leading-relaxed">
            Olá! Recebemos os seus dados. Para garantir a segurança dos nossos clientes e a qualidade dos nossos profissionais, realizamos uma verificação manual de cada perfil. Você receberá um e-mail assim que sua conta for liberada para aceitar serviços.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MontadorPendingApproval;
