
import React from "react";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 max-w-4xl mx-auto">
      <ScrollArea className="h-[calc(100vh-2rem)] px-1">
        <div className="space-y-8 pb-20">
          <div className="text-center py-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground mt-2">Last updated: April 23, 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Syfte och omfattning</h2>
            <p>Syftet med denna integritetspolicy är att ge dig som användare av Quicklists tjänster en transparent och lättförståelig bild av hur vi samlar in, behandlar, lagrar och i vissa fall delar dina personuppgifter. Policyn gäller för all vår databehandling, både i appen och på vår webbplats, och är en integrerad del av våra användarvillkor.</p>
            <p>Genom att godkänna våra användarvillkor och fortsätta använda våra tjänster samtycker du till att dina personuppgifter hanteras enligt denna policy.</p>
          </section>

          {/* Continue with all other sections... */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Kontaktinformation</h2>
            <p>Har du frågor eller vill utöva någon av dina rättigheter? Kontakta oss gärna:</p>
            <ul className="list-none space-y-2">
              <li>📧 E-post: support@quicklist.app</li>
              <li>🌍 Webbplats: www.quicklist.app</li>
              <li>🏢 Postadress: Quicklist AB, [Gatuadress], 111 22 Stockholm</li>
            </ul>
          </section>

          <div className="pt-8">
            <Link to="/auth" className="text-primary hover:underline">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Privacy;
